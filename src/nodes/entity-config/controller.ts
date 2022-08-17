import EventEmitter from 'events';
import { Node } from 'node-red';

import { EventsList } from '../../common/events/Events';
import { IntegrationEvent } from '../../common/Integration';
import { INTEGRATION_EVENT } from '../../const';
import { RED } from '../../globals';
import { addEventListeners, removeEventListeners } from '../../helpers/utils';
import { Credentials } from '../../homeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import { ServerNode } from '../../types/nodes';

type Config = {
    property: string;
    value: string;
};

type Event = {
    type: string;
    data: Record<string, any>;
};

export default class EntityConfigController extends EventEmitter {
    private readonly node: Node;
    private readonly config;
    private readonly server;
    private subscription?: SubscriptionUnsubscribe;
    private registered = false;
    private events: EventsList;

    constructor({ node, config }: { node: Node; config: any }) {
        super();
        this.node = node;
        this.config = config;
        const serverNode = RED.nodes.getNode(
            this.config.server
        ) as ServerNode<Credentials>;
        this.server = serverNode.controller;

        // Setup event listeners
        node.on('close', this.onClose.bind(this));
        this.events = [
            [ClientEvent.Close, this.onHaEventsClose],
            [INTEGRATION_EVENT, this.onHaIntegration],
        ];
        addEventListeners(this.events, this.server?.homeAssistant?.eventBus);

        if (this.server?.homeAssistant?.isIntegrationLoaded) {
            this.registerEntity();
        }
    }

    async onClose(removed: boolean, done: () => void) {
        // Remove event listeners
        removeEventListeners(this.events, this.server?.homeAssistant?.eventBus);
        if (removed && this.server?.homeAssistant?.isIntegrationLoaded) {
            this.removeFromHomeAssistant();
        }
        this.removeSubscription();
        done();
    }

    onHaEventsClose = () => {
        this.registered = false;
    };

    onHaIntegration = (type: IntegrationEvent) => {
        switch (type) {
            case IntegrationEvent.Loaded:
                this.registerEntity();
                break;
            case IntegrationEvent.Unloaded:
            case IntegrationEvent.NotLoaded:
                this.removeSubscription();
                this.registered = false;
                break;
        }
    };

    getDiscoveryPayload(config: Record<string, any> = {}) {
        return {
            type: 'nodered/discovery',
            server_id: this.server.node.id,
            node_id: this.node.id,
            component: this.config.entityType,
            config,
        };
    }

    async registerEntity() {
        if (this.registered) {
            return;
        }

        const haConfig: Record<string, any> = {};
        const config = this.config.haConfig as Config[];
        config
            .filter((c) => c.value.length)
            .forEach((e) => (haConfig[e.property] = e.value));

        try {
            const payload = this.getDiscoveryPayload(haConfig);
            this.node.debug(`Registering with Home Assistant`);
            this.subscription =
                await this.server?.homeAssistant?.websocket.subscribeMessage(
                    this.onHaEventMessage.bind(this),
                    payload,
                    { resubscribe: false }
                );
        } catch (e: unknown) {
            this.node.error((e as Error).message);
            return;
        }
        this.registered = true;
    }

    onHaEventMessage(evt: Event) {
        switch (evt?.type) {
            case 'automation_triggered':
                this.handleTriggerMessage(evt.data);
                break;
        }
    }

    async handleTriggerMessage(data = {}) {
        this.emit('triggered', data);
    }

    removeFromHomeAssistant() {
        const payload = { ...this.getDiscoveryPayload(), remove: true };

        this.server?.homeAssistant?.websocket.send(payload);
        this.removeSubscription();
    }

    async removeSubscription() {
        if (this.subscription) {
            this.node.debug('Unregistering from HA');
            await this.subscription().catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
        }
        this.subscription = undefined;
    }
}
