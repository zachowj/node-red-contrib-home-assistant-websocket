import {
    HassEntities,
    HassEntity as HomeAssistantEntity,
    HassServices,
} from 'home-assistant-js-websocket';

import ClientEvents from '../../common/events/ClientEvents';
import { HA_EVENT_SERVICES_UPDATED } from '../../const';
import { toCamelCase } from '../../helpers/utils';
import { Credentials } from '../../homeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { ServerNode } from '../../types/nodes';

interface HomeAssistantStatesContext {
    [entity_id: string]: HomeAssistantEntity;
}

interface HomeAssistantServerContext {
    states: HomeAssistantStatesContext;
    services: HassServices;
    isConnected: boolean;
    isRunning: boolean;
}

interface HomeAssistantGlobalContext {
    [serverName: string]: HomeAssistantServerContext;
}

const NAMESPACE = 'homeassistant';

export default class EditorContext {
    #clientEvents: ClientEvents;
    #node: ServerNode<Credentials>;

    constructor(node: ServerNode<Credentials>, clientEvents: ClientEvents) {
        this.#clientEvents = clientEvents;
        this.#node = node;

        const globalContext = this.#node.context().global.get(NAMESPACE) as
            HomeAssistantGlobalContext | undefined;

        if (!globalContext?.[this.#serverName]) {
            if (!globalContext) {
                this.#node.context().global.set(NAMESPACE, {});
            }
            this.#resetContext();
        }

        this.#startListeners();
    }

    get #serverName() {
        return toCamelCase(this.#node.config.name);
    }

    #resetContext() {
        this.#node.context().global.set(`${NAMESPACE}.${this.#serverName}`, {
            states: {},
            services: {},
            isConnected: false,
            isRunning: false,
        });
    }

    #startListeners() {
        // Setup event listeners
        this.#clientEvents.addListeners(this, [
            [ClientEvent.Close, this.#onHaClose],
            [ClientEvent.Open, this.#onHaOpen],
            [ClientEvent.Connecting, this.#onHaConnecting],
            [ClientEvent.Error, this.#onHaError],
            [ClientEvent.Running, this.#onHaRunning],
            [ClientEvent.StatesUpdated, this.#onHaStatesUpdated],
            [HA_EVENT_SERVICES_UPDATED, this.#onHaServicesUpdated],
        ]);
    }

    #setOnContext(key: string, value: any) {
        const serverContext = `${NAMESPACE}.${this.#serverName}.${key}`;
        this.#node.context().global.set(serverContext, value);
    }

    #onHaOpen() {
        this.#setOnContext('isConnected', true);
    }

    #onHaStatesUpdated(states: HassEntities) {
        this.#setOnContext('states', states);
    }

    #onHaServicesUpdated(services: HassServices) {
        this.#setOnContext('services', services);
    }

    #onHaConnecting() {
        this.#setOnContext('isConnected', false);
        this.#setOnContext('isRunning', false);
    }

    #onHaClose() {
        this.#setOnContext('isConnected', false);
        this.#setOnContext('isRunning', false);
    }

    #onHaRunning() {
        this.#setOnContext('isRunning', true);
    }

    #onHaError() {
        this.#setOnContext('isConnected', false);
        this.#setOnContext('isRunning', false);
    }
}
