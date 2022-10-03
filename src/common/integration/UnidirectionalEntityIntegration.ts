import { compareVersions } from 'compare-versions';

import { EntityType } from '../../const';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { DeviceConfigNode } from '../../nodes/device-config/index';
import { EntityConfigNode } from '../../nodes/entity-config/index';
import { NodeDone } from '../../types/nodes';
import ClientEvents from '../events/ClientEvents';
import { NodeEvent } from '../events/Events';
import State from '../State';
import Status from '../status/Status';
import { createHaConfig } from './helpers';
import Integration, {
    IntegrationState,
    MessageBase,
    MessageType,
} from './Integration';

export interface DeviceInfo {
    id: string;
    hw_version?: string;
    name: string;
    manufacturer?: string;
    model?: string;
    sw_version?: string;
}

export interface DiscoveryMessage extends MessageBase {
    type: MessageType.Discovery;
    config?: Record<string, any>;
    component: EntityType;
    remove?: boolean;
    state?: any;
    attributes?: Record<string, any>;
    device_info?: DeviceInfo;
}

export interface EntityMessage extends MessageBase {
    type: MessageType.Entity;
    state?: any;
    attributes?: Record<string, any>;
}

export interface UnidirectionalIntegrationConstructor {
    clientEvents: ClientEvents;
    deviceConfigNode?: DeviceConfigNode;
    entityConfigNode: EntityConfigNode;
    homeAssistant: HomeAssistant;
    state: State;
}

export default class UnidirectionalIntegration extends Integration {
    protected readonly clientEvents: ClientEvents;
    protected readonly deviceConfigNode?: DeviceConfigNode;
    protected readonly entityConfigNode: EntityConfigNode;

    protected registered = false;
    protected notInstallMessage =
        'Node-RED custom integration needs to be installed in Home Assistant for this node to function correctly.';

    constructor(props: UnidirectionalIntegrationConstructor) {
        super(props);
        this.clientEvents = props.clientEvents;
        this.deviceConfigNode = props.deviceConfigNode;
        this.entityConfigNode = props.entityConfigNode;
    }

    async init() {
        this.entityConfigNode.on(
            NodeEvent.Close,
            this.onEntityConfigNodeClose.bind(this)
        );
        this.deviceConfigNode?.on(
            NodeEvent.Close,
            this.onDeviceConfigNodeClose.bind(this)
        );
        this.clientEvents.addListeners(this, [
            [ClientEvent.Close, this.onHaEventsClose],
            [ClientEvent.Integration, this.#onHaIntegration],
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

    protected async onEntityConfigNodeClose(removed: boolean, done: NodeDone) {
        if (this.registered && this.isIntegrationLoaded && removed) {
            try {
                await this.unregisterEntity();
            } catch (err) {
                done(err as Error);
            }
        }
        done();
    }

    protected async onDeviceConfigNodeClose(removed: boolean, done: NodeDone) {
        if (this.registered && this.isIntegrationLoaded && removed) {
            try {
                await this.#removeDevice();
            } catch (err) {
                done(err as Error);
            }
        }
        done();
    }

    protected onHaEventsClose() {
        this.registered = false;
    }

    async #onHaIntegration(type: IntegrationState) {
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

    protected getDeviceInfo(): DeviceInfo | undefined {
        if (!this.deviceConfigNode) {
            return undefined;
        }

        const config = this.deviceConfigNode.config;

        return {
            id: config.id,
            hw_version: config.hwVersion,
            name: config.name,
            manufacturer: config.manufacturer,
            model: config.model,
            sw_version: config.swVersion,
        };
    }

    protected getStateData(state?: State): Partial<EntityMessage> {
        if (!state) {
            return {};
        }

        let data: Partial<EntityMessage> = {};

        switch (this.entityConfigNode.config.entityType) {
            case EntityType.BinarySensor:
            case EntityType.Sensor: {
                if (this.entityConfigNode.config.resend && state) {
                    const lastPayload = state.getLastPayload();
                    if (lastPayload) {
                        data = { ...lastPayload };
                    }
                }
                break;
            }
        }

        return data;
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
        const deviceInfo = this.getDeviceInfo();

        const message: DiscoveryMessage = {
            ...this.getStateData(state),
            type: MessageType.Discovery,
            server_id: this.entityConfigNode.config.server,
            node_id: this.entityConfigNode.id,
            config,
            component: this.entityConfigNode.config.entityType,
            remove,
            device_info: deviceInfo,
        };

        return message;
    }

    protected getEntityPayload(
        state?: State,
        attributes?: Record<string, any>
    ): EntityMessage {
        return {
            type: MessageType.Entity,
            server_id: this.entityConfigNode.config.server,
            node_id: this.entityConfigNode.id,
            state,
            attributes,
        };
    }

    protected async registerEntity() {
        if (!this.isIntegrationLoaded) {
            this.entityConfigNode.error(this.notInstallMessage);
            this.status.forEach((status) =>
                status.setFailed('home-assistant.status.error')
            );
            return;
        }

        if (this.isRegistered) return;

        const config = createHaConfig(this.entityConfigNode.config.haConfig);

        const payload = this.getDiscoveryPayload({
            config,
            state: this.state,
        });

        // this.node.debugToClient(payload);

        this.entityConfigNode.debug(
            `Registering ${this.entityConfigNode.config.entityType} with HA`
        );
        try {
            await this.homeAssistant.websocket.send(payload);
        } catch (err) {
            this.status.forEach((status) =>
                status.setFailed('Error registering')
            );
            const message = err instanceof Error ? err.message : err;
            this.entityConfigNode.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }

        this.status.forEach((status) => status?.setSuccess('Registered'));

        this.registered = true;
    }

    public setStatus(status: Status) {
        this.status.push(status);
    }

    public async updateStateAndAttributes(
        state: any,
        attributes: Record<string, any>
    ) {
        const payload = this.getEntityPayload(state, attributes);
        await this.homeAssistant.websocket.send(payload);
        if (this.entityConfigNode.config.resend) {
            const lastPayload = {
                state,
                attributes,
            };
            this.state.setLastPayload(lastPayload);
        }

        return payload;
    }

    protected async unregisterEntity() {
        this.entityConfigNode.debug(
            `Unregistering ${this.entityConfigNode.config.entityType} node from HA`
        );

        const payload = this.entityConfigNode.integration.getDiscoveryPayload({
            remove: true,
        });
        await this.homeAssistant?.websocket.send(payload);
    }

    // device endpoints are only available in 1.1.0+
    #isValidVersionforDevices() {
        return (
            compareVersions(
                `${this.homeAssistant.websocket.integrationVersion}`,
                '1.1'
            ) >= 0
        );
    }

    async #removeDevice() {
        if (!this.deviceConfigNode || !this.#isValidVersionforDevices()) return;

        this.deviceConfigNode.debug(
            `Removing device from Home Assistant: ${this.deviceConfigNode.config.name}`
        );

        await this.homeAssistant?.websocket.send({
            type: MessageType.RemoveDevice,
            node_id: this.deviceConfigNode.id,
        });
    }
}
