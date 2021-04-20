const cloneDeep = require('lodash.clonedeep');
const debug = require('debug')('home-assistant:ws');
const selectn = require('selectn');
const {
    callService,
    createConnection,
    getUser,
    subscribeConfig,
    subscribeEntities,
    subscribeServices,
    ERR_CANNOT_CONNECT,
    ERR_CONNECTION_LOST,
    ERR_HASS_HOST_REQUIRED,
    ERR_INVALID_AUTH,
    ERR_INVALID_HTTPS_TO_HTTP,
} = require('home-assistant-js-websocket');

const createSocket = require('./createSocket');
const {
    HA_EVENT_DEVICE_REGISTRY_UPDATED,
    HA_EVENT_INTEGRATION,
    HA_EVENT_STATE_CHANGED,
    HA_EVENTS,
    INTEGRATION_EVENT,
    INTEGRATION_NOT_LOADED,
    INTEGRATION_LOADED,
    INTEGRATION_UNLOADED,
    STATE_DISCONNECTED,
    STATE_ERROR,
    STATE_CONNECTED,
    STATE_CONNECTING,
    HA_EVENT_TAG_SCANNED,
} = require('../const');
const { subscribeDeviceRegistry } = require('./collections');

class Websocket {
    constructor(config, eventBus) {
        this.eventBus = eventBus;
        this.config = config;
        this.connectionState = STATE_DISCONNECTED;
        this.states = {};
        this.services = {};
        this.devices = [];
        this.tags = null;
        this.statesLoaded = false;
        this.client = null;
        this.subscribedEvents = new Set();
        this.unsubCallback = {};
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;

        this.eventBus.on(
            'ha_client:connecting',
            this.onClientConnecting.bind(this)
        );
        this.onStatesLoadedAndRunning('initial_connection_ready');
    }

    emitEvent(event, data) {
        return this.eventBus.emit(event, data);
    }

    async connect() {
        // Convert from http:// -> ws://, https:// -> wss://
        const url = `ws${this.config.baseUrl.substr(4)}/api/websocket`;

        const auth = {
            type: 'auth',
            [this.config.legacy ? 'api_password' : 'access_token']: this.config
                .apiPass,
        };

        this.client = await createConnection({
            createSocket: () =>
                createSocket({
                    auth,
                    connectionDelay: this.config.connectionDelay,
                    eventBus: this.eventBus,
                    rejectUnauthorizedCerts: this.config
                        .rejectUnauthorizedCerts,
                    url,
                }),
        }).catch((e) => {
            this.connectionState = STATE_ERROR;
            this.emitEvent('ha_client:error');
            // Handle connection errors
            switch (e) {
                case ERR_CANNOT_CONNECT:
                    throw new Error('Cannot connect to Home Assistant server');
                case ERR_INVALID_AUTH:
                    throw new Error(
                        'Invalid access token or password for websocket'
                    );
                case ERR_CONNECTION_LOST:
                    throw new Error('connection lost');
                case ERR_HASS_HOST_REQUIRED:
                    throw new Error('Base URL not set in server config');
                case ERR_INVALID_HTTPS_TO_HTTP:
                    throw new Error('ERR_INVALID_HTTPS_TO_HTTP');
            }
            throw e;
        });

        // Check if user has admin privileges
        await this.checkUserType();

        this.onClientOpen();
        // emit connected for only the first connection to the server
        // so we can setup certain things only once like registerEvents
        this.emitEvent('ha_client:connected');
        this.clientEvents();
        this.haEvents();
    }

    async checkUserType() {
        const user = await this.getUser();
        if (user.is_admin === false) {
            this.connectionState = STATE_ERROR;
            this.client.close();
            throw new Error(
                'User required to have admin privileges in Home Assistant'
            );
        }
    }

    getUser() {
        return getUser(this.client);
    }

    clientEvents() {
        // Client events
        const events = {
            ready: this.onClientOpen,
            disconnected: this.onClientClose,
            'reconnect-error': this.onClientError,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.client.addEventListener(event, callback.bind(this))
        );
    }

    async haEvents() {
        // Home Assistant Events
        await this.client.subscribeEvents(
            (evt) => this.integrationEvent(evt),
            HA_EVENT_INTEGRATION
        );
        await this.updateTagList();
        subscribeConfig(this.client, (config) =>
            this.onClientConfigUpdate(config)
        );

        subscribeEntities(this.client, (ent) => this.onClientStates(ent));
        subscribeServices(this.client, (ent) => this.onClientServices(ent));
        subscribeDeviceRegistry(this.client, (devices) => {
            this.emitEvent(HA_EVENT_DEVICE_REGISTRY_UPDATED, devices);
            this.devices = devices;
        });
    }

    onHomeAssistantRunning() {
        if (!this.isHomeAssistantRunning) {
            this.isHomeAssistantRunning = true;
            this.emitEvent('ha_client:running');
            if (!this.isIntegrationLoaded) {
                this.createIntegrationEvent(INTEGRATION_NOT_LOADED);
            }
        }
    }

    integrationEvent(evt) {
        const oldVersion = this.integrationVersion;
        switch (evt.data.type) {
            case INTEGRATION_LOADED:
                this.integrationVersion = evt.data.version;
                break;
            case INTEGRATION_UNLOADED:
                this.integrationVersion = 0;
                break;
            case INTEGRATION_NOT_LOADED:
                this.emitEvent(INTEGRATION_EVENT, evt.data.type);
                return;
        }
        if (oldVersion !== this.integrationVersion) {
            this.emitEvent(INTEGRATION_EVENT, evt.data.type);
        }
    }

    async subscribeEvents(events) {
        const currentEvents = new Set(Object.values(events));

        // If events contains '__ALL__' register all events and skip individual ones
        if (currentEvents.has('__ALL__')) {
            if (this.subscribedEvents.has('__ALL__')) {
                // Nothing to do
                return;
            }

            this.subscribedEvents.forEach((e) => {
                if (e !== '__ALL__') {
                    this.unsubCallback[e]();
                    delete this.unsubCallback[e];
                    this.subscribedEvents.delete(e);
                }
            });

            // subscribe to all event and save unsubscribe callback
            this.unsubCallback.__ALL__ = await this.client.subscribeEvents(
                (ent) => this.onClientEvents(ent)
            );

            this.subscribedEvents.add('__ALL__');
            return;
        }

        // Always need the state_changed event
        currentEvents.add(HA_EVENT_STATE_CHANGED);
        currentEvents.add(HA_EVENT_TAG_SCANNED);

        const add = new Set(
            [...currentEvents].filter((x) => !this.subscribedEvents.has(x))
        );
        const remove = new Set(
            [...this.subscribedEvents].filter((x) => !currentEvents.has(x))
        );

        // Create new subscription list
        this.subscribedEvents = new Set([
            ...[...currentEvents].filter((x) => this.subscribedEvents.has(x)),
            ...add,
        ]);

        // Remove unused subscriptions
        remove.forEach((e) => {
            this.unsubCallback[e]();
            delete this.unsubCallback[e];
        });

        // Subscribe to each event type and save each unsubscribe callback
        for (const type of add) {
            this.unsubCallback[type] = await this.client.subscribeEvents(
                (ent) => this.onClientEvents(ent),
                type
            );
        }
    }

    subscribeMessage(callback, subscribeMessage, options) {
        return this.client.subscribeMessage(
            callback,
            subscribeMessage,
            options
        );
    }

    onClientStates(msg) {
        if (!msg || Object.keys(msg).length === 0) {
            return;
        }

        this.states = msg;

        if (!this.statesLoaded) {
            this.statesLoaded = true;
            this.emitEvent('ha_client:states_loaded', this.states);
        }
    }

    onClientServices(msg) {
        if (!msg || Object.keys(msg).length === 0) {
            return;
        }

        this.services = msg;

        if (!this.servicesLoaded) {
            this.servicesLoaded = true;
            this.emitEvent('ha_client:services_loaded', this.services);
        }
    }

    onStatesLoadedAndRunning(event = 'ready') {
        const statesLoaded = new Promise((resolve, reject) => {
            this.eventBus.once('ha_client:states_loaded', resolve);
        });
        const homeAssinstantRunning = new Promise((resolve, reject) => {
            this.eventBus.once('ha_client:running', resolve);
        });
        Promise.all([statesLoaded, homeAssinstantRunning]).then(([states]) => {
            this.eventBus.emit(`ha_client:${event}`, states);
        });
    }

    onClientEvents(msg) {
        if (!msg || !msg.data || msg.data === 'ping') {
            return;
        }

        const eventType = msg.event_type;
        const entityId = selectn('data.entity_id', msg);
        const event = {
            event_type: eventType,
            entity_id: entityId,
            event: msg.data,
            origin: msg.origin,
            time_fired: msg.time_fired,
            context: msg.context,
        };

        if (eventType === HA_EVENT_STATE_CHANGED) {
            const state = selectn('event.new_state', event);
            // Validate a minimum state_changed event
            if (state && entityId) {
                this.states[entityId] = state;
            } else {
                debug(
                    `Not processing ${HA_EVENT_STATE_CHANGED} event: ${JSON.stringify(
                        event
                    )}`
                );
                return;
            }
        }

        // Emit on the event type channel
        if (eventType) {
            this.emitEvent(`${HA_EVENTS}:${eventType}`, event);

            // Most specific emit for event_type and entity_id
            if (entityId) {
                this.emitEvent(`${HA_EVENTS}:${eventType}:${entityId}`, event);
            }
        }

        // Emit on all channel
        this.emitEvent(`${HA_EVENTS}:all`, event);
    }

    async onClientConfigUpdate(config) {
        if (
            config.components.includes('nodered') &&
            this.integrationVersion === 0
        ) {
            try {
                const version = await this.getIntegrationVersion();
                this.createIntegrationEvent(INTEGRATION_LOADED, version);
            } catch (e) {}
        }

        // Prior to HA 0.111.0 state didn't exist
        if (config.state === undefined || config.state === 'RUNNING') {
            this.onHomeAssistantRunning();
        }
    }

    async updateTagList() {
        this.tags = await this.client.sendMessagePromise({
            type: 'tag/list',
        });
    }

    getIntegrationVersion() {
        return this.send({
            type: 'nodered/version',
        });
    }

    createIntegrationEvent(type, version) {
        this.integrationEvent({
            data: { type, version },
        });
    }

    onClientOpen() {
        this.onStatesLoadedAndRunning();
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;
        this.connectionState = STATE_CONNECTED;
        this.emitEvent('ha_client:open');
    }

    onClientClose() {
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;
        this.connectionState = STATE_DISCONNECTED;
        this.emitEvent('ha_client:close');

        debug('events connection closed, cleaning up connection');
        this.resetClient();
    }

    onClientError(data) {
        debug('events connection error, cleaning up connection');
        debug(data);
        this.emitEvent('ha_client:error', data);
        this.resetClient();
    }

    onClientConnecting() {
        this.connectionState = STATE_CONNECTING;
    }

    resetClient() {
        this.servicesLoaded = false;
        this.statesLoaded = false;
        this.connectionState = STATE_DISCONNECTED;
        this.emitEvent('ha_client:close');
    }

    getDevices() {
        return this.devices;
    }

    getDeviceActions(deviceId) {
        if (!deviceId) return [];

        return this.client.sendMessagePromise({
            type: 'device_automation/action/list',
            device_id: deviceId,
        });
    }

    getDeviceActionCapabilities(action) {
        if (!action) return [];

        return this.client.sendMessagePromise({
            type: 'device_automation/action/capabilities',
            action,
        });
    }

    getDeviceTriggers(deviceId) {
        if (!deviceId) return [];

        return this.client.sendMessagePromise({
            type: 'device_automation/trigger/list',
            device_id: deviceId,
        });
    }

    getDeviceTriggerCapabilities(trigger) {
        if (!trigger) return [];

        return this.client.sendMessagePromise({
            type: 'device_automation/trigger/capabilities',
            trigger,
        });
    }

    getStates(entityId) {
        if (entityId) {
            return this.states[entityId]
                ? cloneDeep(this.states[entityId])
                : null;
        }

        return cloneDeep(this.states);
    }

    getServices() {
        return cloneDeep(this.services);
    }

    getTranslations(category, language) {
        if (!category) return [];

        return this.client.sendMessagePromise({
            type: 'frontend/get_translations',
            language,
            category,
        });
    }

    callService(domain, service, data) {
        debug(`Call-Service: ${domain}.${service} ${JSON.stringify(data)}`);
        return callService(this.client, domain, service, data);
    }

    send(data) {
        debug(`Send: ${JSON.stringify(data)}`);
        return this.client.sendMessagePromise(data);
    }
}

module.exports = Websocket;
