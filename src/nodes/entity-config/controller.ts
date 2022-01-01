import EventEmitter from 'events';
import merge from 'lodash.merge';
import { Node } from 'node-red';

import {
    INTEGRATION_EVENT,
    INTEGRATION_LOADED,
    INTEGRATION_NOT_LOADED,
    INTEGRATION_UNLOADED,
} from '../../const';
import { RED } from '../../globals';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import { ServerNode } from '../../types/nodes';

const nodeDefaults = {
    name: {},
    version: (nodeDef: { version?: number }) => nodeDef.version ?? 0,
    server: {},
    haConfig: {},
    entityType: {},
};

type Config = {
    property: string;
    value: string;
};

type Event = {
    type: string;
    data: Record<string, any>;
};

type IntegrationEvent =
    | typeof INTEGRATION_LOADED
    | typeof INTEGRATION_NOT_LOADED
    | typeof INTEGRATION_UNLOADED;

export default class EntityConfigController extends EventEmitter {
    private node: Node;
    private nodeConfig;
    private server;
    private subscription?: SubscriptionUnsubscribe;
    private registered = false;

    constructor({ node, config }: { node: Node; config: any }) {
        super();
        this.node = node;
        this.nodeConfig = merge({}, nodeDefaults, config);
        const serverNode = RED.nodes.getNode(
            this.nodeConfig.server
        ) as ServerNode;
        this.server = serverNode.controller;

        // Setup event listeners
        node.on('close', this.onClose.bind(this));
        const events = {
            'ha_client:close': this.onHaEventsClose,
            'ha_client:error': this.onHaEventsError,
            [INTEGRATION_EVENT]: this.onHaIntegration,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.server?.homeAssistant?.addListener(event, callback.bind(this))
        );

        if (this.server?.homeAssistant?.isIntegrationLoaded) {
            this.registerEntity();
        }
    }

    async onClose(removed: boolean, done: () => void) {
        if (removed && this.server?.homeAssistant.isIntegrationLoaded) {
            this.removeFromHomeAssistant();
        }
        this.removeSubscription();
        done();
    }

    onHaEventsOpen() {
        this.subscription = undefined;
    }

    onHaEventsClose() {
        this.registered = false;
    }

    onHaEventsError(err: Error) {
        this.node.error(err.message ?? err);
    }

    onHaIntegration(type: IntegrationEvent) {
        switch (type) {
            case INTEGRATION_LOADED:
                this.registerEntity();
                break;
            case INTEGRATION_UNLOADED:
            case INTEGRATION_NOT_LOADED:
                this.removeSubscription();
                this.registered = false;
                break;
        }
    }

    getDiscoveryPayload(config: Record<string, any> = {}) {
        return {
            type: 'nodered/discovery',
            server_id: this.server.node.id,
            node_id: this.node.id,
            component: this.nodeConfig.entityType,
            config,
        };
    }

    async registerEntity() {
        if (this.registered) {
            return;
        }

        const haConfig: Record<string, any> = {};
        const config = this.nodeConfig.haConfig as Config[];
        config
            .filter((c) => c.value.length)
            .forEach((e) => (haConfig[e.property] = e.value));

        try {
            const payload = this.getDiscoveryPayload(haConfig);
            this.node.debug(`Registering with Home Assistant`);
            this.subscription =
                await this.server.homeAssistant.subscribeMessage(
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

        this.server?.homeAssistant?.send(payload);
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
