import { INTEGRATION_EVENT } from '../../const';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { EntityConfigNode } from '../../nodes/entity-config/index';
import { NodeDone } from '../../types/nodes';
import ClientEvents from '../events/ClientEvents';
import State from '../states/State';
import { Status } from '../status/Status';
import { createHaConfig } from './helpers';

export enum IntegrationState {
    Loaded = 'loaded',
    NotLoaded = 'notloaded',
    Unloaded = 'unloaded',
}

export enum IntegrationEvent {
    Trigger = 'trigger',
}

export enum EntityType {
    BinarySensor = 'binary_sensor',
    Button = 'button',
    Sensor = 'sensor',
}

export enum MessageType {
    Discovery = 'nodered/discovery',
    Entity = 'nodered/entity',
}

export interface MessageBase {
    type: MessageType;
    server_id: string;
    node_id: string;
}

export interface DiscoveryMessage extends MessageBase {
    type: MessageType.Discovery;
    config?: Record<string, any>;
    component: EntityType;
    remove?: boolean;
    state?: any;
    attributes?: Record<string, any>;
}

export interface EntityMessage extends MessageBase {
    type: MessageType.Entity;
    state?: any;
    attributes?: Record<string, any>;
}

export interface IntegrationConstructor {
    clientEvents: ClientEvents;
    homeAssistant: HomeAssistant;
    node: EntityConfigNode;
    state: State;
}

export default class Integration {
    protected readonly clientEvents: ClientEvents;
    protected readonly homeAssistant: HomeAssistant;
    protected readonly node: EntityConfigNode;
    public readonly state: State;
    protected status: Status[] = [];

    protected registered = false;
    protected notInstallMessage =
        'Node-RED custom integration needs to be installed in Home Assistant for this node to function correctly.';

    constructor({
        clientEvents,
        homeAssistant,
        node,
        state,
    }: IntegrationConstructor) {
        this.clientEvents = clientEvents;
        this.homeAssistant = homeAssistant;
        this.node = node;
        this.state = state;
    }

    async init() {
        this.node.on('close', this.onClose.bind(this));
        this.clientEvents.addListeners(this, [
            [ClientEvent.Close, this.onHaEventsClose],
            [INTEGRATION_EVENT, this.onHaIntegration],
        ]);

        if (this.isIntegrationLoaded) {
            await this.registerEntity();
        }
    }

    get isIntegrationLoaded(): boolean {
        return this.homeAssistant.isIntegrationLoaded;
    }

    get isRegistered(): boolean {
        return this.registered;
    }

    protected async onClose(removed: boolean, done: NodeDone) {
        if (this.registered && this.isIntegrationLoaded && removed) {
            try {
                await this.unregisterEntity();
                done();
            } catch (err) {
                done(err as Error);
            }
        } else {
            done();
        }
    }

    protected onHaEventsClose() {
        this.registered = false;
    }

    private async onHaIntegration(type: IntegrationState) {
        switch (type) {
            case IntegrationState.Loaded:
                await this.registerEntity();
                break;
            case IntegrationState.Unloaded:
            case IntegrationState.NotLoaded:
                this.registered = false;
                break;
        }
    }

    protected getDiscoveryPayload({
        config,
        remove,
        state,
    }: {
        config?: Record<string, any>;
        remove?: boolean;
        state?: State;
    }): DiscoveryMessage {
        let message: DiscoveryMessage = {
            type: MessageType.Discovery,
            server_id: this.node.config.server,
            node_id: this.node.id,
            config,
            component: this.node.config.entityType,
            remove,
        };

        const lastPayload = state?.getLastPayload();
        if (lastPayload) {
            message = { ...lastPayload, ...message };
        }

        return message;
    }

    protected getEntityPayload(
        state?: State,
        attributes?: Record<string, any>
    ): EntityMessage {
        return {
            type: MessageType.Entity,
            server_id: this.node.config.server,
            node_id: this.node.id,
            state,
            attributes,
        };
    }

    protected async registerEntity() {
        if (!this.isIntegrationLoaded) {
            this.node.error(this.notInstallMessage);
            this.status.forEach((status) => status.setFailed('Error'));
            return;
        }

        if (this.isRegistered) {
            return;
        }

        const config = createHaConfig(this.node.config.haConfig);

        const payload = this.getDiscoveryPayload({
            config,
            state: this.node.config.resend ? this.state : undefined,
        });

        // this.node.debugToClient(payload);

        this.node.debug(`Registering ${this.node.config.entityType} with HA`);
        try {
            await this.homeAssistant.websocket.send(payload);
        } catch (err) {
            this.status.forEach((status) =>
                status.setFailed('Error registering')
            );
            const message = err instanceof Error ? err.message : err;
            this.node.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }

        this.status.forEach((status) => status?.setSuccess('Registered'));

        this.registered = true;
    }

    setStatus(status: Status) {
        this.status.push(status);
    }

    async updateStateAndAttributes(
        state: any,
        attributes: Record<string, any>
    ) {
        const payload = this.getEntityPayload(state, attributes);
        await this.homeAssistant.websocket.send(payload);
        if (this.node.config.resend) {
            const lastPayload = {
                state,
                attributes,
            };
            this.state.setLastPayload(lastPayload);
        }

        return payload;
    }

    async unregisterEntity() {
        this.node.debug(
            `Unregistering ${this.node.config.entityType} node from HA`
        );

        const payload = this.node.integration.getDiscoveryPayload({
            remove: true,
        });
        await this.homeAssistant?.websocket.send(payload);
    }
}
