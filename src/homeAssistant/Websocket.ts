import Debug from 'debug';
import { EventEmitter } from 'events';
import {
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
    HA_EVENT_INTEGRATION,
    HA_EVENT_SERVICES_UPDATED,
    HA_EVENTS,
    HA_MIN_VERSION,
    INTEGRATION_EVENT,
    INTEGRATION_LOADED,
    INTEGRATION_NOT_LOADED,
    INTEGRATION_UNLOADED,
    NO_VERSION,
} from '../const';
import { RED } from '../globals';
import {
    HassArea,
    HassAreas,
    HassDevice,
    HassDeviceActions,
    HassDeviceCapabilities,
    HassDevices,
    HassDeviceTriggers,
    HassEntityRegistryEntry,
    HassFloor,
    HassLabel,
    HassTag,
    HassTags,
    HassTranslations,
    SubscriptionUnsubscribe,
} from '../types/home-assistant';
import { Credentials, HaEvent } from './';
import {
    subscribeAreaRegistry,
    subscribeDeviceRegistry,
    subscribeEntityRegistry,
    subscribeFloorRegistry,
    subscribeLabelRegistry,
} from './collections';
import createSocket, { atLeastHaVersion } from './createSocket';
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
    extra_fields: HassDeviceCapabilities;
};

export enum ClientState {
    Connecting = 0,
    Connected = 1,
    Disconnected = 2,
    Error = 3,
    Running = 4,
}

export enum ClientEvent {
    Close = 'ha_client:close',
    Connected = 'ha_client:connected',
    Connecting = 'ha_client:connecting',
    Error = 'ha_client:error',
    InitialConnectionReady = 'initial_connection_ready',
    Integration = 'integration',
    Open = 'ha_client:open',
    Ready = 'ha_client:ready',
    RegistriesLoaded = 'ha_client:registries_loaded',
    Running = 'ha_client:running',
    ServicesLoaded = 'ha_client:services_loaded',
    StatesLoaded = 'ha_client:states_loaded',
}

export default class Websocket {
    readonly #config: WebsocketConfig;
    readonly #eventBus: EventEmitter;
    #servicesLoaded = false;
    #statesLoaded = false;
    #stopHeartbeat?: StopHeartbeat;
    #subscribedEvents = new Set<string>();
    #unsubCallback: { [id: string]: () => void } = {};
    #isAreaRegistryLoaded = false;
    #isDeviceRegistryLoaded = false;
    #isEntityRegistryLoaded = false;
    #isFloorRegistryLoaded = false;
    #isLabelRegistryLoaded = false;
    #isAllRegistriesLoaded = false;

    areas: HassAreas = [];
    client!: Connection;
    devices: HassDevices = [];
    entities: HassEntityRegistryEntry[] = [];
    floors: HassFloor[] = [];
    labels: HassLabel[] = [];
    connectionState = ClientState.Disconnected;
    integrationVersion = NO_VERSION;
    isHomeAssistantRunning = false;
    states: HassEntities = {};
    services: HassServices = {};
    tags: HassTags | null = null;

    constructor(config: WebsocketConfig, eventBus: EventEmitter) {
        this.#config = config;
        this.#eventBus = eventBus;

        this.#eventBus.on(
            ClientEvent.Connecting,
            this.onClientConnecting.bind(this),
        );
        this.onStatesLoadedAndRunning(ClientEvent.InitialConnectionReady);
    }

    get isConnected(): boolean {
        return this.connectionState === ClientState.Connected;
    }

    get isStatesLoaded(): boolean {
        return this.#statesLoaded;
    }

    #emitEvent(event: string, data?: any) {
        return this.#eventBus.emit(event, data);
    }

    async connect(): Promise<void> {
        // Convert from http:// -> ws://, https:// -> wss://
        const url = `ws${this.#config.host.substring(4)}/api/websocket`;

        const auth = {
            type: 'auth',
            access_token: this.#config.access_token,
        };

        this.client = await createConnection({
            createSocket: () =>
                createSocket({
                    auth,
                    connectionDelay: this.#config.connectionDelay,
                    eventBus: this.#eventBus,
                    rejectUnauthorizedCerts:
                        this.#config.rejectUnauthorizedCerts,
                    url,
                }) as unknown as Promise<HaWebSocket>,
        }).catch((e) => {
            this.connectionState = ClientState.Error;
            this.#emitEvent(ClientEvent.Error);

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
        await this.#checkUserType();
        // Check if Home Assistant version is supported
        this.#checkHomeAssistantVersion();

        this.onClientOpen();
        // emit connected for only the first connection to the server
        // so we can setup certain things only once like registerEvents
        this.#emitEvent(ClientEvent.Connected);
        this.#clientEvents();
        this.#haEvents();
    }

    #checkHomeAssistantVersion() {
        const [major, minor, patch] = HA_MIN_VERSION.split('.').map(Number);
        if (!atLeastHaVersion(this.client.haVersion, major, minor, patch)) {
            this.connectionState = ClientState.Error;
            this.client.close();
            throw new Error(
                RED._('home-assistant.error.ha_version_not_supported', {
                    version: this.client.haVersion,
                    min_version: HA_MIN_VERSION,
                }),
            );
        }
    }

    async #checkUserType() {
        const user = await this.getUser();
        if (user.is_admin === false) {
            this.connectionState = ClientState.Error;
            this.client.close();
            throw new Error(RED._('home-assistant.error.user_not_admin'));
        }
    }

    getUser(): Promise<HassUser> {
        return getUser(this.client);
    }

    #clientEvents() {
        // Client events
        this.client.addEventListener('ready', this.onClientOpen.bind(this));
        this.client.addEventListener(
            'disconnected',
            this.onClientClose.bind(this),
        );
        this.client.addEventListener(
            'reconnect-error',
            this.onClientError.bind(this),
        );
    }

    async #haEvents() {
        // Home Assistant Events
        await this.client.subscribeEvents<HassEvent>(
            (evt) => this.#integrationEvent(evt),
            HA_EVENT_INTEGRATION,
        );
        subscribeConfig(this.client, (config) =>
            this.onClientConfigUpdate(config),
        );
        subscribeEntities(this.client, this.onClientStates.bind(this));
        subscribeServices(this.client, this.onClientServices.bind(this));

        subscribeAreaRegistry(this.client, (areas) => {
            this.#isAreaRegistryLoaded = true;
            this.areas = areas;
            this.#checkIfAllRegistriesLoaded();
            this.#emitEvent(HaEvent.AreaRegistryUpdated, areas);
        });
        subscribeDeviceRegistry(this.client, (devices) => {
            this.#isDeviceRegistryLoaded = true;
            this.devices = devices;
            this.#checkIfAllRegistriesLoaded();
            this.#emitEvent(HaEvent.DeviceRegistryUpdated, devices);
        });
        subscribeEntityRegistry(this.client, (entities) => {
            this.#isEntityRegistryLoaded = true;
            this.entities = entities;
            this.#checkIfAllRegistriesLoaded();
            this.#emitEvent(HaEvent.EntityRegistryUpdated, entities);
        });
        subscribeFloorRegistry(this.client, (floors) => {
            this.#isFloorRegistryLoaded = true;
            this.floors = floors;
            this.#checkIfAllRegistriesLoaded();
            this.#emitEvent(HaEvent.FloorRegistryUpdated, floors);
        });
        subscribeLabelRegistry(this.client, (labels) => {
            this.#isLabelRegistryLoaded = true;
            this.labels = labels;
            this.#checkIfAllRegistriesLoaded();
            this.#emitEvent(HaEvent.LabelRegistryUpdated, labels);
        });
    }

    #checkIfAllRegistriesLoaded() {
        if (
            !this.#isAllRegistriesLoaded &&
            this.#isAreaRegistryLoaded &&
            this.#isDeviceRegistryLoaded &&
            this.#isEntityRegistryLoaded &&
            this.#isFloorRegistryLoaded &&
            this.#isLabelRegistryLoaded &&
            this.isStatesLoaded &&
            this.#servicesLoaded
        ) {
            this.#emitEvent(ClientEvent.RegistriesLoaded);
            this.#isAllRegistriesLoaded = true;
            RED.log.debug('[Home Assistant] All registries loaded');
        }
    }

    get isAllRegistriesLoaded(): boolean {
        return this.#isAllRegistriesLoaded;
    }

    #onHomeAssistantRunning() {
        if (!this.isHomeAssistantRunning) {
            this.isHomeAssistantRunning = true;
            this.#emitEvent(ClientEvent.Running);
            if (this.integrationVersion === NO_VERSION) {
                this.createIntegrationEvent(INTEGRATION_NOT_LOADED);
            }
        }
    }

    #integrationEvent(evt: Partial<HassEvent>) {
        const oldVersion = this.integrationVersion;
        switch (evt?.data?.type) {
            case INTEGRATION_LOADED:
                this.integrationVersion = evt.data.version;
                break;
            case INTEGRATION_UNLOADED:
                this.integrationVersion = NO_VERSION;
                break;
            case INTEGRATION_NOT_LOADED:
                this.#emitEvent(INTEGRATION_EVENT, evt.data.type);
                return;
        }
        if (oldVersion !== this.integrationVersion) {
            this.#emitEvent(INTEGRATION_EVENT, evt?.data?.type);
        }
    }

    async subscribeEvents(events: { [nodeId: string]: string }): Promise<void> {
        const currentEvents = new Set(Object.values(events));

        // If events contains '__ALL__' register all events and skip individual ones
        if (currentEvents.has('__ALL__')) {
            if (this.#subscribedEvents.has('__ALL__')) {
                // Nothing to do
                return;
            }

            this.#subscribedEvents.forEach((e) => {
                if (e !== '__ALL__') {
                    this.#unsubCallback[e]();
                    delete this.#unsubCallback[e];
                    this.#subscribedEvents.delete(e);
                }
            });

            // subscribe to all event and save unsubscribe callback
            this.#unsubCallback.__ALL__ =
                await this.client.subscribeEvents<HassEvent>((ent) =>
                    this.onClientEvents(ent),
                );

            this.#subscribedEvents.add('__ALL__');
            return;
        }

        // Always need the state_changed event
        currentEvents.add(HaEvent.StateChanged);
        currentEvents.add(HaEvent.TagScanned);

        const add = new Set(
            [...currentEvents].filter((x) => !this.#subscribedEvents.has(x)),
        );
        const remove = new Set(
            [...this.#subscribedEvents].filter((x) => !currentEvents.has(x)),
        );

        // Create new subscription list
        this.#subscribedEvents = new Set([
            ...[...currentEvents].filter((x) => this.#subscribedEvents.has(x)),
            ...add,
        ]);

        // Remove unused subscriptions
        remove.forEach((e) => {
            this.#unsubCallback[e]();
            delete this.#unsubCallback[e];
        });

        // Subscribe to each event type and save each unsubscribe callback
        for (const type of add) {
            this.#unsubCallback[type] =
                await this.client.subscribeEvents<HassEvent>(
                    (ent) => this.onClientEvents(ent),
                    type,
                );
        }
    }

    subscribeMessage<Result>(
        callback: (result: Result) => void,
        subscribeMessage: MessageBase,
        options: { resubscribe?: boolean },
    ): Promise<SubscriptionUnsubscribe> {
        return this.client.subscribeMessage(
            callback,
            subscribeMessage,
            options,
        );
    }

    onClientStates(entities: HassEntities): void {
        if (!entities || Object.keys(entities).length === 0) {
            return;
        }

        this.states = entities;

        if (!this.#statesLoaded) {
            this.#statesLoaded = true;
            this.#emitEvent(ClientEvent.StatesLoaded, this.states);
            this.#checkIfAllRegistriesLoaded();
        }
    }

    onClientServices(services: HassServices): void {
        if (!services || Object.keys(services).length === 0) {
            return;
        }

        this.services = services;
        this.#emitEvent(HA_EVENT_SERVICES_UPDATED, this.services);
        if (!this.#servicesLoaded) {
            this.#servicesLoaded = true;
            this.#emitEvent(ClientEvent.ServicesLoaded);
            this.#checkIfAllRegistriesLoaded();
        }
    }

    onStatesLoadedAndRunning(event: ClientEvent = ClientEvent.Ready): void {
        const statesLoaded = new Promise((resolve) => {
            this.#eventBus.once(ClientEvent.ServicesLoaded, resolve);
        });
        const homeAssinstantRunning = new Promise((resolve) => {
            this.#eventBus.once(ClientEvent.Running, resolve);
        });
        Promise.all([statesLoaded, homeAssinstantRunning]).then(([states]) => {
            this.#eventBus.emit(event, states);
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

        if (eventType === HaEvent.StateChanged) {
            const state = event?.event?.new_state;
            // Validate a minimum state_changed event
            if (state && entityId) {
                this.states[entityId] = state;
            } else {
                debug(
                    `Not processing ${HaEvent.StateChanged} event: ${JSON.stringify(
                        event,
                    )}`,
                );
                return;
            }
        }

        // Emit on the event type channel
        if (eventType) {
            this.#emitEvent(`${HA_EVENTS}:${eventType}`, event);

            // Most specific emit for event_type and entity_id
            if (entityId) {
                this.#emitEvent(`${HA_EVENTS}:${eventType}:${entityId}`, event);
            }
        }

        // Emit on all channel
        this.#emitEvent(`${HA_EVENTS}:all`, event);
    }

    async onClientConfigUpdate(config: HassConfig): Promise<void> {
        if (
            config.components.includes('nodered') &&
            this.integrationVersion === NO_VERSION
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
            this.#onHomeAssistantRunning();
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
        this.#integrationEvent({
            data: { type, version },
        });
    }

    onClientOpen(): void {
        this.onStatesLoadedAndRunning();
        this.integrationVersion = NO_VERSION;
        this.isHomeAssistantRunning = false;
        this.connectionState = ClientState.Connected;
        if (this.#config.heartbeatInterval) {
            this.#stopHeartbeat = startHeartbeat(
                this.client,
                this.#config.heartbeatInterval,
                this.#config.host,
            );
        }
        this.#emitEvent(ClientEvent.Open);
    }

    onClientClose(): void {
        debug('events connection closed, cleaning up connection');
        this.resetClient();
    }

    onClientError(data: unknown): void {
        debug('events connection error, cleaning up connection');
        debug(data);
        this.#emitEvent(ClientEvent.Error, data);
        this.resetClient();
    }

    onClientConnecting(): void {
        this.connectionState = ClientState.Connecting;
    }

    close(): void {
        if (typeof this.#stopHeartbeat === 'function') this.#stopHeartbeat();
        this?.client?.close();
    }

    resetClient(): void {
        this.integrationVersion = NO_VERSION;
        this.isHomeAssistantRunning = false;
        this.#servicesLoaded = false;
        this.#statesLoaded = false;
        this.#isAreaRegistryLoaded = false;
        this.#isDeviceRegistryLoaded = false;
        this.#isEntityRegistryLoaded = false;
        this.#isFloorRegistryLoaded = false;
        this.#isLabelRegistryLoaded = false;
        this.connectionState = ClientState.Disconnected;
        this.#emitEvent(ClientEvent.Close);
    }

    getAreas(areaId: string): HassArea | undefined;
    getAreas(): HassAreas;
    getAreas(areaId?: unknown): unknown {
        if (typeof areaId === 'string') {
            this.getArea(areaId);
        }

        return cloneDeep(this.areas);
    }

    getArea(areaId: string): HassArea | undefined {
        return cloneDeep(this.areas.find((area) => area.area_id === areaId));
    }

    getDevices(deviceId: string): HassDevice | undefined;
    getDevices(): HassDevices;
    getDevices(deviceId?: unknown): unknown {
        if (typeof deviceId === 'string') {
            this.getDevice(deviceId);
        }

        return cloneDeep(this.devices);
    }

    getDevice(deviceId: string): HassDevice | undefined {
        return cloneDeep(this.devices.find((device) => device.id === deviceId));
    }

    async getDeviceActions(deviceId?: string): Promise<HassDeviceActions> {
        if (!this.isConnected || !deviceId) return [];

        const results = await this.send<HassDeviceActions>({
            type: 'device_automation/action/list',
            device_id: deviceId,
        }).catch((e) => {
            throw e;
        });

        return results;
    }

    async getDeviceActionCapabilities(action: {
        [key: string]: any;
    }): Promise<HassDeviceCapabilities> {
        if (!this.isConnected || !action) return [];

        const results = await this.send<HassDeviceCapabilitiesResponse>({
            type: 'device_automation/action/capabilities',
            action,
        }).catch((e) => {
            throw e;
        });

        return results.extra_fields;
    }

    async getDeviceTriggers(deviceId?: string): Promise<HassDeviceTriggers> {
        if (!this.isConnected || !deviceId) return [];

        const results = await this.send<HassDeviceTriggers>({
            type: 'device_automation/trigger/list',
            device_id: deviceId,
        }).catch((e) => {
            throw e;
        });

        return results;
    }

    async getDeviceTriggerCapabilities(trigger: {
        [key: string]: any;
    }): Promise<HassDeviceCapabilities> {
        if (!this.isConnected || !trigger) return [];

        const results = await this.send<HassDeviceCapabilitiesResponse>({
            type: 'device_automation/trigger/capabilities',
            trigger,
        }).catch((e) => {
            throw e;
        });

        return results.extra_fields;
    }

    getEntities(): HassEntityRegistryEntry[];
    getEntities(entityId?: string): HassEntityRegistryEntry | undefined;
    getEntities(entityId?: unknown): unknown {
        if (typeof entityId === 'string') {
            this.getEntity(entityId);
        }

        return cloneDeep(this.entities);
    }

    getEntity(entityId: string): HassEntityRegistryEntry | undefined {
        return cloneDeep(
            this.entities.find((entity) => entity.entity_id === entityId),
        );
    }

    getFloors(floorId: string): HassFloor | undefined;
    getFloors(): HassFloor[];
    getFloors(floorId?: unknown): unknown {
        if (typeof floorId === 'string') {
            this.getFloor(floorId);
        }

        return cloneDeep(this.floors);
    }

    getFloor(floorId: string): HassFloor | undefined {
        return cloneDeep(
            this.floors.find((floor) => floor.floor_id === floorId),
        );
    }

    getLabels(labelId: string): HassLabel | undefined;
    getLabels(): HassLabel[];
    getLabels(labelId?: unknown): unknown {
        if (typeof labelId === 'string') {
            this.getLabels(labelId);
        }

        return cloneDeep(this.labels);
    }

    getLabel(labelId: string): HassLabel | undefined {
        return cloneDeep(
            this.labels.find((label) => label.label_id === labelId),
        );
    }

    getStates(): HassEntities;
    getStates(entityId?: string): HassEntity | null;
    getStates(entityId?: unknown): unknown {
        if (typeof entityId === 'string') {
            return this.states[entityId]
                ? cloneDeep(this.states[entityId])
                : null;
        }

        return cloneDeep(this.states);
    }

    getServices(): HassServices {
        return cloneDeep(this.services);
    }

    getTag(tagId: string): HassTag | undefined {
        return cloneDeep(this.tags?.find((tag) => tag.id === tagId));
    }

    async getTranslations(
        category: string,
        language: string,
    ): Promise<HassTranslations> {
        if (!this.isConnected || !category) return [];

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
        target?: HassServiceTarget,
    ): Promise<Record<string, unknown>> {
        const services = this.getServices();
        const returnResponse = atLeastHaVersion(this.client.haVersion, 2023, 12)
            ? !!services[domain]?.[service]?.response
            : undefined;

        const serviceCall = {
            type: 'call_service',
            domain,
            service,
            service_data: data,
            target,
            return_response: returnResponse,
        };

        return this.send(serviceCall);
    }

    send<Results>(data: MessageBase): Promise<Results> {
        if (!this.isConnected) {
            throw new Error('Client is not connected');
        }
        debug(`Send: ${JSON.stringify(data)}`);
        return this.client?.sendMessagePromise(data);
    }
}
