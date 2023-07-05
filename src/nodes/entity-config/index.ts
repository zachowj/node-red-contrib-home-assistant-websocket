import ClientEvents from '../../common/events/ClientEvents';
import BidirectionalIntegration from '../../common/integration/BidirectionalEntityIntegration';
import Integration from '../../common/integration/UnidirectionalEntityIntegration';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import State from '../../common/State';
import { EntityType } from '../../const';
import { HassExposedConfig } from '../../editor/types';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import { DeviceConfigNode } from '../device-config/index';

export interface EntityConfigNodeProperties extends BaseNodeProperties {
    entityType: EntityType;
    server: string;
    deviceConfig: string;
    resend: boolean;
    haConfig: HassExposedConfig[];
}

export interface EntityConfigNode extends BaseNode {
    config: EntityConfigNodeProperties;
    enableInput: boolean;
    integration: Integration;
    state: State;
}

export default function entityConfigNode(
    this: EntityConfigNode,
    config: EntityConfigNodeProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    const deviceConfigNode = getNode<DeviceConfigNode>(
        this.config.deviceConfig
    );
    this.state = new State(this);

    const props = {
        clientEvents,
        deviceConfigNode,
        entityConfigNode: this,
        homeAssistant,
        state: this.state,
    };

    switch (this.config.entityType) {
        case EntityType.BinarySensor:
        case EntityType.Sensor: {
            this.integration = new Integration(props);
            break;
        }
        case EntityType.Button:
        case EntityType.Switch: {
            this.integration = new BidirectionalIntegration(props);
            break;
        }
        case EntityType.Number:
        case EntityType.Select:
        case EntityType.Text: {
            this.integration = new ValueEntityIntegration(props);
            break;
        }
        default:
            throw new Error(`Unknown entity type: ${this.config.entityType}`);
    }
    this.integration.init();
}
