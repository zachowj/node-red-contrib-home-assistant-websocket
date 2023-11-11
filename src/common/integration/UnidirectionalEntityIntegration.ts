import { compareVersions } from 'compare-versions';

import { EntityType } from '../../const';
import { debugToClient } from '../../helpers/node';
import { DeviceConfigNode } from '../../nodes/device-config/index';
import { EntityConfigNode } from '../../nodes/entity-config/index';
import { NodeDone } from '../../types/nodes';
import { NodeEvent } from '../events/Events';
import State from '../State';
import Status from '../status/Status';
import { createHaConfig } from './helpers';
import Integration, {
    IntegrationConstructor,
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

export interface UnidirectionalIntegrationConstructor
    extends IntegrationConstructor {
    deviceConfigNode?: DeviceConfigNode;
    entityConfigNode: EntityConfigNode;
}

export default class UnidirectionalIntegration extends Integration {
    protected readonly deviceConfigNode?: DeviceConfigNode;
    protected readonly entityConfigNode: EntityConfigNode;

    constructor(props: UnidirectionalIntegrationConstructor) {
        super(props);
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
        super.init();
    }

    protected async onEntityConfigNodeClose(removed: boolean, done: NodeDone) {
        if (this.registered && this.isIntegrationLoaded && removed) {
            try {
                await this.unregister();
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

        if (this.entityConfigNode.config.resend && state) {
            const lastPayload = state.getLastPayload();
            if (lastPayload) {
                data = { ...lastPayload };
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

    protected async register() {
        if (!this.isIntegrationLoaded) {
            this.entityConfigNode.error(this.notInstalledMessage);
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

        this.debugToClient('register', payload);

        this.entityConfigNode.debug(
            `Registering ${this.entityConfigNode.config.entityType} with HA`
        );
        try {
            await this.homeAssistant.websocket.send(payload);
        } catch (err) {
            this.status.forEach((status) =>
                status.setFailed('home-assistant.status.error_registering')
            );
            const message = err instanceof Error ? err.message : err;
            this.entityConfigNode.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }

        this.saveHaConfigToContext(config);
        this.status.forEach((status) =>
            status?.setSuccess('home-assistant.status.registered')
        );

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

        this.debugToClient('update state', payload);

        return payload;
    }

    protected async unregister() {
        this.entityConfigNode.debug(
            `Unregistering ${this.entityConfigNode.config.entityType} node from HA`
        );

        const payload = this.entityConfigNode.integration.getDiscoveryPayload({
            remove: true,
        });

        this.debugToClient('unregister', payload);

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

    protected debugToClient(topic: string, message: any) {
        debugToClient(this.entityConfigNode, message, topic);
    }

    public getEntityConfigNode(): EntityConfigNode {
        return this.entityConfigNode;
    }

    /**
     * This method retrieves the value of a specific key from the Home Assistant configuration for the entity.
     * If the key does not exist in the configuration, it returns undefined.
     *
     * @param key - The key for which to retrieve the value.
     * @returns The value of the key from the Home Assistant configuration, or undefined if the key does not exist.
     */
    public getEntityHomeAssistantConfigValue(
        key: string
    ): string | number | string[] | undefined {
        // Get the Home Assistant configuration from the context or the entity's config
        const haConfig =
            this.getHaConfigFromContext() ??
            createHaConfig(this.entityConfigNode.config.haConfig);

        return haConfig[key];
    }

    /**
     * This method saves the Home Assistant (HA) configuration to the context.
     * It first retrieves any existing HA configuration from the context.
     * Then it removes any properties from the new HA configuration that have undefined values.
     * Finally, it merges the existing and new HA configurations and saves the result back to the context.
     *
     * @param haConfig - The new HA configuration to save. Properties with undefined values will not be saved.
     */
    public saveHaConfigToContext(haConfig: Record<string, any>) {
        const existingHaConfig = this.getHaConfigFromContext() ?? {};
        // remove undefined values from haConfig
        Object.keys(haConfig).forEach(
            (key) => haConfig[key] === undefined && delete haConfig[key]
        );

        const mergedHaConfig = {
            ...existingHaConfig,
            ...haConfig,
        };
        this.entityConfigNode.context().set('haConfig', mergedHaConfig);
    }

    /**
     * This method retrieves the Home Assistant (HA) configuration from the context.
     * If the HA configuration does not exist in the context, it returns undefined.
     *
     * @returns The HA configuration from the context, or undefined if it does not exist.
     */
    public getHaConfigFromContext(): Record<string, any> | undefined {
        return this.entityConfigNode.context().get('haConfig') as
            | Record<string, any>
            | undefined;
    }
}
