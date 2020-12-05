'use strict';
const cloneDeep = require('lodash.clonedeep');
const debug = require('debug')('home-assistant:ws');
const EventEmitter = require('events').EventEmitter;
const homeassistant = require('home-assistant-js-websocket');
const selectn = require('selectn');
const WebSocket = require('ws');

const {
    HA_EVENT_INTEGRATION,
    HA_EVENT_STATE_CHANGED,
    HA_EVENTS,
    INTEGRATION_EVENT,
    INTEGRATION_NOT_LOADED,
    INTEGRATION_LOADED,
    INTEGRATION_UNLOADED,
} = require('./const');

const connectionStates = ['CONNECTING', 'CONNECTED', 'DISCONNECTED', 'ERROR'];

class HaWebsocket extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.connectionState = HaWebsocket.DISCONNECTED;
        this.states = {};
        this.services = {};
        this.statesLoaded = false;
        this.client = null;
        this.subscribedEvents = new Set();
        this.unsubCallback = {};
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;

        this.setMaxListeners(0);
    }

    get isConnected() {
        return this.connectionState === this.CONNECTED;
    }

    get CONNECTING() {
        return HaWebsocket.CONNECTING;
    }

    get CONNECTED() {
        return HaWebsocket.CONNECTED;
    }

    get DISCONNECTED() {
        return HaWebsocket.DISCONNECTED;
    }

    get ERROR() {
        return HaWebsocket.ERROR;
    }

    get isIntegrationLoaded() {
        return this.integrationVersion !== 0;
    }

    async connect() {
        this.client = await homeassistant
            .createConnection({
                self: this,
                createSocket: this.createSocket,
            })
            .catch((e) => {
                this.connectionState = HaWebsocket.ERROR;
                this.emit('ha_client:close');

                // Handle connection errors
                switch (e) {
                    case homeassistant.ERR_CANNOT_CONNECT:
                        throw new Error(
                            'Cannot connect to Home Assistant server'
                        );
                    case homeassistant.ERR_INVALID_AUTH:
                        throw new Error(
                            'Invalid access token or password for websocket'
                        );
                    case homeassistant.ERR_CONNECTION_LOST:
                        throw new Error('connection lost');
                    case homeassistant.ERR_HASS_HOST_REQUIRED:
                        throw new Error('Base URL not set in server config');
                    case homeassistant.ERR_INVALID_HTTPS_TO_HTTP:
                        throw new Error('ERR_INVALID_HTTPS_TO_HTTP');
                }
                throw e;
            });

        // Check if user has admin privileges
        const user = await this.getUser();
        if (user.is_admin === false) {
            this.connectionState = HaWebsocket.ERROR;
            this.client.close();
            throw new Error(
                'User required to have admin privileges in Home Assistant'
            );
        }

        this.onClientOpen();
        // emit connected for only the first connection to the server
        // so we can setup certain things only once like registerEvents
        this.emit('ha_client:connected');

        // Client events
        const events = {
            ready: this.onClientOpen,
            disconnected: this.onClientClose,
            'reconnect-error': this.onClientError,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.client.addEventListener(event, callback.bind(this))
        );
        this.onStatesLoadedAndRunning();

        // Home Assistant Events
        await this.client.subscribeEvents(
            (evt) => this.integrationEvent(evt),
            HA_EVENT_INTEGRATION
        );

        homeassistant.subscribeConfig(this.client, (config) =>
            this.onClientConfigUpdate(config)
        );
        homeassistant.subscribeEntities(this.client, (ent) =>
            this.onClientStates(ent)
        );
        homeassistant.subscribeServices(this.client, (ent) =>
            this.onClientServices(ent)
        );

        return true;
    }

    getUser() {
        return homeassistant.getUser(this.client);
    }

    onHomeAssistantRunning() {
        if (!this.isHomeAssistantRunning) {
            this.isHomeAssistantRunning = true;
            this.emit('ha_client:running');
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
                this.emit(INTEGRATION_EVENT, evt.data.type);
                return;
        }
        if (oldVersion !== this.integrationVersion) {
            this.emit(INTEGRATION_EVENT, evt.data.type);
        }
    }

    onStatesLoadedAndRunning() {
        const statesLoaded = new Promise((resolve, reject) => {
            this.once('ha_client:states_loaded', resolve);
        });
        const homeAssinstantRunning = new Promise((resolve, reject) => {
            this.once('ha_client:running', resolve);
        });
        Promise.all([statesLoaded, homeAssinstantRunning]).then(([states]) => {
            this.emit('ha_client:initial_connection_ready', states);
        });
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

    onClientStates(msg) {
        if (!msg || Object.keys(msg).length === 0) {
            return;
        }

        this.states = msg;

        if (!this.statesLoaded) {
            this.statesLoaded = true;
            this.emit('ha_client:states_loaded', this.states);
        }
    }

    onClientServices(msg) {
        if (!msg || Object.keys(msg).length === 0) {
            return;
        }

        this.services = msg;

        if (!this.servicesLoaded) {
            this.servicesLoaded = true;
            this.emit('ha_client:services_loaded', this.services);
        }
    }

    onClientEvents(msg) {
        if (!msg || !msg.data || msg.data === 'ping') {
            return;
        }

        const eventType = msg.event_type;
        const entityId = selectn('data.entity_id', msg);
        const emitEvent = {
            event_type: eventType,
            entity_id: entityId,
            event: msg.data,
            origin: msg.origin,
            time_fired: msg.time_fired,
            context: msg.context,
        };

        if (eventType === HA_EVENT_STATE_CHANGED) {
            const state = selectn('event.new_state', emitEvent);
            // Validate a minimum state_changed event
            if (state && entityId) {
                this.states[entityId] = state;
            } else {
                debug(
                    `Not processing ${HA_EVENT_STATE_CHANGED} event: ${JSON.stringify(
                        emitEvent
                    )}`
                );
                return;
            }
        }

        // Emit on the event type channel
        if (eventType) {
            this.emit(`${HA_EVENTS}:${eventType}`, emitEvent);

            // Most specific emit for event_type and entity_id
            if (entityId) {
                this.emit(`${HA_EVENTS}:${eventType}:${entityId}`, emitEvent);
            }
        }

        // Emit on all channel
        this.emit(`${HA_EVENTS}:all`, emitEvent);
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
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;
        this.connectionState = HaWebsocket.CONNECTED;
        this.emit('ha_client:open');
    }

    onClientClose() {
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;
        this.connectionState = HaWebsocket.DISCONNECTED;
        this.emit('ha_client:close');

        this.closeClient(
            null,
            'events connection closed, cleaning up connection'
        );
    }

    onClientError(data) {
        this.closeClient(
            data,
            'events connection error, cleaning up connection'
        );
    }

    closeClient(err, logMsg) {
        if (logMsg) {
            debug(logMsg);
        }
        if (err) {
            debug(err);
            this.emit('ha_client:error', err);
        }

        this.servicesLoaded = false;
        this.statesLoaded = false;

        if (this.client && this.client.readyState === this.client.CLOSED) {
            this.connectionState = HaWebsocket.DISCONNECTED;
            this.emit('ha_client:close');
        }
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

    callService(domain, service, data) {
        return homeassistant.callService(this.client, domain, service, data);
    }

    send(data) {
        return this.client.sendMessagePromise(data);
    }

    /*
     * Pretty much a copy from https://github.com/home-assistant/home-assistant-js-websocket
     */
    createSocket() {
        const self = this.self;

        // Convert from http:// -> ws://, https:// -> wss://
        const url = `ws${self.config.baseUrl.substr(4)}/api/websocket`;

        const authObj = {
            type: 'auth',
        };

        authObj[self.config.legacy ? 'api_password' : 'access_token'] =
            self.config.apiPass;

        debug('[Auth Phase] Initializing', url);

        function connect(promResolve, promReject) {
            debug('[Auth Phase] New connection', url);
            self.connectionState = self.CONNECTING;
            self.emit('ha_client:connecting');

            const socket = new WebSocket(url, {
                rejectUnauthorized: self.config.rejectUnauthorizedCerts,
            });

            // If invalid auth, we will not try to reconnect.
            let invalidAuth = false;

            const onOpen = async (event) => {
                try {
                    socket.send(JSON.stringify(authObj));
                } catch (err) {
                    invalidAuth = err === homeassistant.ERR_INVALID_AUTH;
                    socket.close();
                }
            };

            const onMessage = async (event) => {
                const message = JSON.parse(event.data);

                debug('[Auth Phase] Received', message);

                switch (message.type) {
                    case homeassistant.MSG_TYPE_AUTH_INVALID:
                        invalidAuth = true;
                        socket.close();
                        break;

                    case homeassistant.MSG_TYPE_AUTH_OK:
                        socket.removeEventListener('open', onOpen);
                        socket.removeEventListener('message', onMessage);
                        socket.removeEventListener('close', onClose);
                        socket.removeEventListener('error', onClose);
                        promResolve(socket);
                        break;

                    default:
                        if (
                            message.type !==
                            homeassistant.MSG_TYPE_AUTH_REQUIRED
                        ) {
                            debug('[Auth Phase] Unhandled message', message);
                        }
                }
            };

            const onClose = () => {
                // If we are in error handler make sure close handler doesn't also fire.
                socket.removeEventListener('close', onClose);
                if (invalidAuth) {
                    promReject(homeassistant.ERR_INVALID_AUTH);
                    return;
                }

                // Try again in a second
                setTimeout(() => connect(promResolve, promReject), 5000);
            };

            socket.addEventListener('open', onOpen);
            socket.addEventListener('message', onMessage);
            socket.addEventListener('close', onClose);
            socket.addEventListener('error', onClose);
        }

        return new Promise((resolve, reject) => {
            // if hass.io, do a 5 second delay so it doesn't spam the hass.io proxy
            // https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76
            setTimeout(
                () => connect(resolve, reject),
                self.config.connectionDelay !== false ? 5000 : 0
            );
        });
    }
}

connectionStates.forEach((readyState, i) => {
    HaWebsocket[connectionStates[i]] = i;
});

module.exports = HaWebsocket;
