import Debug from 'debug';
import { EventEmitter } from 'events';
import {
    callService,
    Connection,
    createConnection,
    ERR_CANNOT_CONNECT,
    ERR_CONNECTION_LOST,
    ERR_HASS_HOST_REQUIRED,
    ERR_INVALID_AUTH,
    ERR_INVALID_HTTPS_TO_HTTP,
    getUser,
    HassConfig,
    HassEntities,
    HassEntity,
    HassEvent,
    HassServices,
    HassServiceTarget,
    HassUser,
    HaWebSocket,
    MessageBase,
    subscribeConfig,
    subscribeEntities,
    subscribeServices,
} from 'home-assistant-js-websocket';
import { cloneDeep } from 'lodash';

import {
    HA_EVENT_AREA_REGISTRY_UPDATED,
    HA_EVENT_DEVICE_REGISTRY_UPDATED,
    HA_EVENT_INTEGRATION,
    HA_EVENT_REGISTRY_UPDATED,
    HA_EVENT_SERVICES_UPDATED,
    HA_EVENT_STATE_CHANGED,
    HA_EVENT_TAG_SCANNED,
    HA_EVENTS,
    INTEGRATION_EVENT,
    INTEGRATION_LOADED,
    INTEGRATION_NOT_LOADED,
    INTEGRATION_UNLOADED,
    STATE_CONNECTED,
    STATE_CONNECTING,
    STATE_DISCONNECTED,
    STATE_ERROR,
} from '../const';
import { RED } from '../globals';
import {
    HassAreas,
    HassDeviceActions,
    HassDeviceCapabilities,
    HassDevices,
    HassDeviceTriggers,
    HassEntityRegistryEntry,
    HassTags,
    HassTranslations,
    SubscriptionUnsubscribe,
} from '../types/home-assistant';
import { Credentials } from './';
import {
    subscribeAreaRegistry,
    subscribeDeviceRegistry,
    subscribeEntityRegistry,
} from './collections';
import createSocket from './createSocket';
import { startHeartbeat, StopHeartbeat } from './heartbeat';

const debug = Debug('home-assistant:ws');

export type WebsocketConfig = Credentials & {
    rejectUnauthorizedCerts: boolean;
    connectionDelay: boolean;
    heartbeatInterval: number;
};

type HassTranslationsResponse = {
    resources: HassTranslations;
};

type HassDeviceCapabilitiesResponse = {
    // eslint-disable-next-line camelcase
    extra_fields: HassDeviceCapabilities;
};

export default class Websocket {
    private servicesLoaded = false;
    private statesLoaded = false;
    private subscribedEvents = new Set<string>();
    private unsubCallback: { [id: string]: () => void } = {};
    private stopHeartbeat?: StopHeartbeat;

    areas: HassAreas = [];
    client!: Connection;
    devices: HassDevices = [];
    entities: HassEntityRegistryEntry[] = [];
    connectionState = STATE_DISCONNECTED;
    integrationVersion: string | number = 0;
    isHomeAssistantRunning = false;
    states: HassEntities = {};
    services: HassServices = {};
    tags: HassTags | null = null;

    constructor(
        private config: WebsocketConfig,
        private eventBus: EventEmitter
    ) {
        this.eventBus.on(
            'ha_client:connecting',
            this.onClientConnecting.bind(this)
        );
        this.onStatesLoadedAndRunning('initial_connection_ready');
    }

    private emitEvent(event: string, data?: any) {
        return this.eventBus.emit(event, data);
    }

    async connect(): Promise<void> {
        // Convert from http:// -> ws://, https:// -> wss://
        const url = `ws${this.config.host.substring(4)}/api/websocket`;

        const auth = {
            type: 'auth',
            access_token: this.config.access_token,
        };

        this.client = await createConnection({
            createSocket: () =>
                createSocket({
                    auth,
                    connectionDelay: this.config.connectionDelay,
                    eventBus: this.eventBus,
                    rejectUnauthorizedCerts:
                        this.config.rejectUnauthorizedCerts,
                    url,
                }) as unknown as Promise<HaWebSocket>,
        }).catch((e) => {
            this.connectionState = STATE_ERROR;
            this.emitEvent('ha_client:error');

            // Handle connection errors
            let message: string | undefined;
            switch (e) {
                case ERR_CANNOT_CONNECT:
                    message = RED._('home-assistant.error.cannot-connect');
                    break;
                case ERR_INVALID_AUTH:
                    message = RED._('home-assistant.error.invalid_auth');
                    break;
                case ERR_CONNECTION_LOST:
                    message = RED._('home-assistant.error.connection_lost');
                    break;
                case ERR_HASS_HOST_REQUIRED:
                    message = RED._('home-assistant.error.hass_host_required');
                    break;
                case ERR_INVALID_HTTPS_TO_HTTP:
                    message = 'ERR_INVALID_HTTPS_TO_HTTP';
                    break;
            }

            throw message ? new Error(message) : e;
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

    private async checkUserType() {
        const user = await this.getUser();
        if (user.is_admin === false) {
            this.connectionState = STATE_ERROR;
            this.client.close();
            throw new Error(RED._('home-assistant.error.user_not_admin'));
        }
    }

    getUser(): Promise<HassUser> {
        return getUser(this.client);
    }

    private clientEvents() {
        // Client events
        this.client.addEventListener('ready', this.onClientOpen.bind(this));
        this.client.addEventListener(
            'disconnected',
            this.onClientClose.bind(this)
        );
        this.client.addEventListener(
            'reconnect-error',
            this.onClientError.bind(this)
        );
    }

    private async haEvents() {
        // Home Assistant Events
        await this.client.subscribeEvents<HassEvent>(
            (evt) => this.integrationEvent(evt),
            HA_EVENT_INTEGRATION
        );
        subscribeConfig(this.client, (config) =>
            this.onClientConfigUpdate(config)
        );
        subscribeEntities(this.client, this.onClientStates.bind(this));
        subscribeServices(this.client, this.onClientServices.bind(this));

        subscribeAreaRegistry(this.client, (areas) => {
            this.emitEvent(HA_EVENT_AREA_REGISTRY_UPDATED, areas);
            this.areas = areas;
        });
        subscribeDeviceRegistry(this.client, (devices) => {
            this.emitEvent(HA_EVENT_DEVICE_REGISTRY_UPDATED, devices);
            this.devices = devices;
            this.emitEvent(HA_EVENT_REGISTRY_UPDATED, {
                devices: this.devices,
                entities: this.entities,
            });
        });
        subscribeEntityRegistry(this.client, (entities) => {
            this.entities = entities;
            this.emitEvent(HA_EVENT_REGISTRY_UPDATED, {
                devices: this.devices,
                entities: this.entities,
            });
        });
    }

    private onHomeAssistantRunning() {
        if (!this.isHomeAssistantRunning) {
            this.isHomeAssistantRunning = true;
            this.emitEvent('ha_client:running');
            if (this.integrationVersion === 0) {
                this.createIntegrationEvent(INTEGRATION_NOT_LOADED);
            }
        }
    }

    private integrationEvent(evt: Partial<HassEvent>) {
        const oldVersion = this.integrationVersion;
        switch (evt?.data?.type) {
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
            this.emitEvent(INTEGRATION_EVENT, evt?.data?.type);
        }
    }

    async subscribeEvents(events: { [nodeId: string]: string }): Promise<void> {
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
            this.unsubCallback.__ALL__ =
                await this.client.subscribeEvents<HassEvent>((ent) =>
                    this.onClientEvents(ent)
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
            this.unsubCallback[type] =
                await this.client.subscribeEvents<HassEvent>(
                    (ent) => this.onClientEvents(ent),
                    type
                );
        }
    }

    subscribeMessage<Result>(
        callback: (result: Result) => void,
        subscribeMessage: MessageBase,
        options: { resubscribe?: boolean }
    ): Promise<SubscriptionUnsubscribe> {
        return this.client.subscribeMessage(
            callback,
            subscribeMessage,
            options
        );
    }

    onClientStates(entities: HassEntities): void {
        if (!entities || Object.keys(entities).length === 0) {
            return;
        }

        this.states = entities;

        if (!this.statesLoaded) {
            this.statesLoaded = true;
            this.emitEvent('ha_client:states_loaded', this.states);
        }
    }

    onClientServices(services: HassServices): void {
        if (!services || Object.keys(services).length === 0) {
            return;
        }

        this.services = services;
        this.emitEvent(HA_EVENT_SERVICES_UPDATED, this.services);
        if (!this.servicesLoaded) {
            this.servicesLoaded = true;
            this.emitEvent('ha_client:services_loaded');
        }
    }

    onStatesLoadedAndRunning(event = 'ready'): void {
        const statesLoaded = new Promise((resolve) => {
            this.eventBus.once('ha_client:states_loaded', resolve);
        });
        const homeAssinstantRunning = new Promise((resolve) => {
            this.eventBus.once('ha_client:running', resolve);
        });
        Promise.all([statesLoaded, homeAssinstantRunning]).then(([states]) => {
            this.eventBus.emit(`ha_client:${event}`, states);
        });
    }

    onClientEvents(hassEvent: HassEvent): void {
        if (!hassEvent || !hassEvent.data) {
            return;
        }

        const eventType = hassEvent.event_type;
        const entityId = hassEvent?.data?.entity_id;
        const event = {
            event_type: eventType,
            entity_id: entityId,
            event: hassEvent.data,
            origin: hassEvent.origin,
            time_fired: hassEvent.time_fired,
            context: hassEvent.context,
        };

        if (eventType === HA_EVENT_STATE_CHANGED) {
            const state = event?.event?.new_state;
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

    async onClientConfigUpdate(config: HassConfig): Promise<void> {
        if (
            config.components.includes('nodered') &&
            this.integrationVersion === 0
        ) {
            try {
                const version = await this.getIntegrationVersion();
                this.createIntegrationEvent(INTEGRATION_LOADED, version);
            } catch (e) {}
        }

        if (!this.tags && config.components.includes('tag')) {
            await this.updateTagList();
        }

        // Prior to HA 0.111.0 state didn't exist
        if (config.state === undefined || config.state === 'RUNNING') {
            this.onHomeAssistantRunning();
        }
    }

    async updateTagList(): Promise<HassTags> {
        try {
            this.tags = await this.send<HassTags>({
                type: 'tag/list',
            });
        } catch (e) {
            debug(`Error fetching tag list: ${e}`);
        }

        return this.tags ?? [];
    }

    getIntegrationVersion(): Promise<string> {
        return this.send<string>({
            type: 'nodered/version',
        });
    }

    createIntegrationEvent(type: string, version?: string): void {
        this.integrationEvent({
            data: { type, version },
        });
    }

    onClientOpen(): void {
        this.onStatesLoadedAndRunning();
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;
        this.connectionState = STATE_CONNECTED;
        if (this.config.heartbeatInterval) {
            this.stopHeartbeat = startHeartbeat(
                this.client,
                this.config.heartbeatInterval,
                this.config.host
            );
        }
        this.emitEvent('ha_client:open');
    }

    onClientClose(): void {
        this.integrationVersion = 0;
        this.isHomeAssistantRunning = false;
        this.connectionState = STATE_DISCONNECTED;
        this.resetClient();
        debug('events connection closed, cleaning up connection');
        this.emitEvent('ha_client:close');
    }

    onClientError(data: unknown): void {
        debug('events connection error, cleaning up connection');
        debug(data);
        this.emitEvent('ha_client:error', data);
        this.resetClient();
    }

    onClientConnecting(): void {
        this.connectionState = STATE_CONNECTING;
    }

    close(): void {
        if (typeof this.stopHeartbeat === 'function') this.stopHeartbeat();
        this?.client?.close();
    }

    resetClient(): void {
        this.servicesLoaded = false;
        this.statesLoaded = false;
        this.connectionState = STATE_DISCONNECTED;
        this.emitEvent('ha_client:close');
    }

    getDevices(): HassDevices {
        return this.devices;
    }

    async getDeviceActions(deviceId?: string): Promise<HassDeviceActions> {
        if (!deviceId) return [];

        return this.send<HassDeviceActions>({
            type: 'device_automation/action/list',
            device_id: deviceId,
        });
    }

    async getDeviceActionCapabilities(action: {
        [key: string]: any;
    }): Promise<HassDeviceCapabilities> {
        if (!action) return [];

        const results = await this.send<HassDeviceCapabilitiesResponse>({
            type: 'device_automation/action/capabilities',
            action,
        });

        return results.extra_fields;
    }

    async getDeviceTriggers(deviceId?: string): Promise<HassDeviceTriggers> {
        if (!deviceId) return [];

        return this.send<HassDeviceTriggers>({
            type: 'device_automation/trigger/list',
            device_id: deviceId,
        });
    }

    async getDeviceTriggerCapabilities(trigger: {
        [key: string]: any;
    }): Promise<HassDeviceCapabilities> {
        if (!trigger) return [];

        const results = await this.send<HassDeviceCapabilitiesResponse>({
            type: 'device_automation/trigger/capabilities',
            trigger,
        });

        return results.extra_fields;
    }

    getStates(entityId?: string): HassEntity | HassEntities | null {
        if (entityId) {
            return this.states[entityId]
                ? cloneDeep(this.states[entityId])
                : null;
        }

        return cloneDeep(this.states);
    }

    getServices(): HassServices {
        return cloneDeep(this.services);
    }

    async getTranslations(
        category: string,
        language: string
    ): Promise<HassTranslations> {
        if (!category) return [];

        const results = await this.send<HassTranslationsResponse>({
            type: 'frontend/get_translations',
            language,
            category,
        });

        return results.resources;
    }

    callService(
        domain: string,
        service: string,
        data?: { [key: string]: any },
        target?: HassServiceTarget
    ): Promise<unknown> {
        debug(`Call-Service: ${domain}.${service} ${JSON.stringify(data)}`);
        return callService(this.client, domain, service, data, target);
    }

    send<Results>(data: MessageBase): Promise<Results> {
        debug(`Send: ${JSON.stringify(data)}`);
        return this.client.sendMessagePromise(data);
    }
}
