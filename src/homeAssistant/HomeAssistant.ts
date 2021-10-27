/* eslint-disable @typescript-eslint/ban-ts-comment */
import Debug from 'debug';
import { EventEmitter } from 'events';
import { HassEntities } from 'home-assistant-js-websocket';

import { STATE_CONNECTED } from '../const';
import { HassTags } from '../types/home-assistant';
import httpAPI from './Http';
import websocketAPI from './Websocket';

const debug = Debug('home-assistant');
const websocketMethods: string[] = [
    'callService',
    'connect',
    'getDevices',
    'getDeviceActions',
    'getDeviceActionCapabilities',
    'getDeviceTriggers',
    'getDeviceTriggerCapabilities',
    'getServices',
    'getStates',
    'getTranslations',
    'getUser',
    'send',
    'subscribeMessage',
];
const httpMethods: string[] = [
    'fireEvent',
    'get',
    'getHistory',
    'post',
    'renderTemplate',
];

export default class HomeAssistant {
    private eventsList: { [nodeId: string]: string } = {};

    eventBus: EventEmitter;
    http: httpAPI;
    websocket: websocketAPI;

    constructor({
        websocketAPI,
        httpAPI,
        eventBus,
    }: {
        websocketAPI: websocketAPI;
        httpAPI: httpAPI;
        eventBus: EventEmitter;
    }) {
        debug('Instantiating HomeAssistant');
        this.eventBus = eventBus;
        this.http = httpAPI;
        this.websocket = websocketAPI;

        this.exposeMethods(this.websocket, websocketMethods);
        this.exposeMethods(this.http, httpMethods);
    }

    get isConnected(): boolean {
        return this.websocket.connectionState === STATE_CONNECTED;
    }

    get isHomeAssistantRunning(): boolean {
        return this.isConnected && this.websocket.isHomeAssistantRunning;
    }

    get integrationVersion(): string | number {
        return this.websocket.integrationVersion;
    }

    get isIntegrationLoaded(): boolean {
        return this.integrationVersion !== 0;
    }

    get connectionState(): number {
        return this.websocket.connectionState;
    }

    get version(): string {
        const client = this?.websocket?.client;
        return client?.haVersion ?? '0.0.0';
    }

    // TODO: remove after typescript conversion done
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    exposeMethods(cls: any, methods: string[]): void {
        methods.forEach((method) => {
            if (typeof cls[method] === 'function') {
                // @ts-ignore
                this[method] = cls[method].bind(cls);
            }
        });
    }

    getEntities(): string[] {
        const states = this.websocket.getStates() as HassEntities;
        const entities = Object.keys(states).sort();

        return entities;
    }

    getTags(): HassTags {
        return this?.websocket?.tags ?? [];
    }

    // TODO: remove after typescript conversion done
    subscribeEvents(): Promise<void> {
        return this.websocket.subscribeEvents(this.eventsList);
    }

    close(): void {
        this?.websocket?.close();
    }

    addListener(
        event: string,
        handler: { (): void },
        options = { once: false }
    ): void {
        if (options.once === true) {
            this.eventBus.once(event, handler);
        } else {
            this.eventBus.on(event, handler);
        }
    }

    removeListener(event: string, handler: { (): void }): void {
        this.eventBus.removeListener(event, handler);
    }
}
