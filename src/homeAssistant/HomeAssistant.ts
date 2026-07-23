import Debug from 'debug';
import { EventEmitter } from 'events';
import { HassEntities } from 'home-assistant-js-websocket';

import { NO_VERSION } from '../const';
import { HassTags } from '../types/home-assistant';
import httpAPI from './Http';
import websocketAPI, { ClientState } from './Websocket';

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

const DEFAULT_CLOSE_DRAIN_TIMEOUT_MS = 2000;

export default class HomeAssistant {
    // TODO: this can be made private after typescript conversion
    public eventsList: { [nodeId: string]: string } = {};

    eventBus: EventEmitter;
    http: httpAPI;
    websocket: websocketAPI;

    /**
     * Registered entity integrations that may still need the websocket
     * during Node-RED close (e.g. to send remove: true). Server close waits
     * until this hits zero so unregister is not racing client.close().
     */
    #entityRefs = 0;
    #refsIdle = Promise.resolve();
    #resolveRefsIdle: (() => void) | null = null;

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

    acquireEntityRef(): void {
        this.#entityRefs += 1;
        if (this.#entityRefs === 1) {
            this.#refsIdle = new Promise((resolve) => {
                this.#resolveRefsIdle = resolve;
            });
        }
    }

    releaseEntityRef(): void {
        if (this.#entityRefs <= 0) {
            return;
        }
        this.#entityRefs -= 1;
        if (this.#entityRefs === 0) {
            this.#resolveRefsIdle?.();
            this.#resolveRefsIdle = null;
            this.#refsIdle = Promise.resolve();
        }
    }

    get entityRefCount(): number {
        return this.#entityRefs;
    }

    get isConnected(): boolean {
        return this.websocket.connectionState === ClientState.Connected;
    }

    get isHomeAssistantRunning(): boolean {
        return this.isConnected && this.websocket.isHomeAssistantRunning;
    }

    get integrationVersion(): string {
        return this.websocket.integrationVersion;
    }

    get isIntegrationLoaded(): boolean {
        return this.integrationVersion !== NO_VERSION;
    }

    get connectionState(): number {
        return this.websocket.connectionState;
    }

    get version(): string {
        const client = this?.websocket?.client;
        return client?.haVersion ?? NO_VERSION;
    }

    // TODO: remove after typescript conversion done
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    exposeMethods(cls: any, methods: string[]): void {
        methods.forEach((method) => {
            if (typeof cls[method] === 'function') {
                // @ts-ignore - needs to remove in the future
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

    subscribeEvents(): Promise<void> {
        return this.websocket.subscribeEvents(this.eventsList);
    }

    async close(
        { timeoutMs }: { timeoutMs?: number } = {},
    ): Promise<void> {
        const drainMs = timeoutMs ?? DEFAULT_CLOSE_DRAIN_TIMEOUT_MS;
        if (this.#entityRefs > 0) {
            debug(
                `Waiting for ${this.#entityRefs} entity ref(s) before closing websocket`,
            );
            await Promise.race([
                this.#refsIdle,
                new Promise<void>((resolve) => {
                    setTimeout(resolve, drainMs);
                }),
            ]);
            if (this.#entityRefs > 0) {
                debug(
                    `Timed out waiting for entity refs (${this.#entityRefs} remaining); closing websocket anyway`,
                );
            }
        }
        this.websocket?.close();
    }

    addListener(
        event: string,
        handler: { (): void },
        options = { once: false },
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
