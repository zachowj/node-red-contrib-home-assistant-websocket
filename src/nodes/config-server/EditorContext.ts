import {
    HassEntity as HomeAssistantEntity,
    HassServices,
} from 'home-assistant-js-websocket';

import ClientEvents from '../../common/events/ClientEvents';
import { HA_EVENT_SERVICES_UPDATED } from '../../const';
import { toCamelCase } from '../../helpers/utils';
import { Credentials, HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { HassEntity } from '../../types/home-assistant';
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

const HOME_ASSISTANT_NAMESPACE = 'homeassistant';

export default class EditorContext {
    #clientEvents: ClientEvents;
    #homeAssistant: HomeAssistant;
    #node: ServerNode<Credentials>;

    constructor(
        node: ServerNode<Credentials>,
        homeAssistant: HomeAssistant,
        clientEvents: ClientEvents
    ) {
        this.#clientEvents = clientEvents;
        this.#homeAssistant = homeAssistant;
        this.#node = node;

        this.setOnContext('states', {});
        this.setOnContext('services', {});
        this.setOnContext('isConnected', false);

        this.startListeners();
    }

    get #serverName() {
        return toCamelCase(this.#node.config.name);
    }

    startListeners() {
        // Setup event listeners
        this.#clientEvents.addListeners(this, [
            [ClientEvent.Close, this.onHaEventsClose],
            [ClientEvent.Open, this.onHaEventsOpen],
            [ClientEvent.Connecting, this.onHaEventsConnecting],
            [ClientEvent.Error, this.onHaEventsError],
            [ClientEvent.Running, this.onHaEventsRunning],
            [ClientEvent.StatesLoaded, this.onHaStatesLoaded],
            [HA_EVENT_SERVICES_UPDATED, this.onHaServicesUpdated],
            [HaEvent.StateChanged, this.onHaStateChanged],
        ]);
    }

    setOnContext(key: keyof HomeAssistantServerContext, value: any) {
        const haCtx =
            (this.#node.context().global.get(HOME_ASSISTANT_NAMESPACE) as
                | HomeAssistantGlobalContext
                | undefined) ?? {};
        haCtx[this.#serverName] ??= {
            states: {} as HomeAssistantStatesContext,
            services: {} as HassServices,
            isConnected: false,
            isRunning: false,
        };
        haCtx[this.#serverName][key] = value;
        this.#node.context().global.set(HOME_ASSISTANT_NAMESPACE, haCtx);
    }

    onHaEventsOpen = () => {
        this.setOnContext('isConnected', true);
    };

    onHaStateChanged = () => {
        const states = this.#homeAssistant.websocket.getStates();
        this.setOnContext('states', states);
    };

    onHaStatesLoaded = (states: HassEntity[]) => {
        this.setOnContext('states', states);
    };

    onHaServicesUpdated = (services: HassServices) => {
        this.setOnContext('services', services);
    };

    onHaEventsConnecting = () => {
        this.setOnContext('isConnected', false);
        this.setOnContext('isRunning', false);
    };

    onHaEventsClose = () => {
        this.setOnContext('isConnected', false);
        this.setOnContext('isRunning', false);
    };

    onHaEventsRunning = () => {
        this.setOnContext('isRunning', true);
    };

    onHaEventsError = () => {
        this.setOnContext('isConnected', false);
        this.setOnContext('isRunning', false);
    };
}
