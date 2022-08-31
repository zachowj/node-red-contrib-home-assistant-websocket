import ClientEvents from '../../common/events/ClientEvents';
import BidirectionalIntegration from '../../common/integration/BidirectionalIntegration';
import Integration, { EntityType } from '../../common/integration/Integration';
import State from '../../common/State';
import { HassExposedConfig } from '../../editor/types';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';

export interface EntityConfigNodeProperties extends BaseNodeProperties {
    entityType: EntityType;
    server: string;
    resend: boolean;
    haConfig: HassExposedConfig[];
}

export interface EntityConfigNode extends BaseNode {
    config: EntityConfigNodeProperties;
    integration: Integration;
}

export default function entityConfigNode(
    this: EntityConfigNode,
    config: EntityConfigNodeProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    const serverConfigNode = getServerConfigNode(this);
    const homeAssistant = serverConfigNode.getHomeAssistant();
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });

    const props = {
        node: this,
        clientEvents,
        homeAssistant,
        state: new State(this),
    };

    switch (props.node.config.entityType) {
        case EntityType.BinarySensor:
        case EntityType.Sensor: {
            this.integration = new Integration(props);
            break;
        }
        case EntityType.Button: {
            this.integration = new BidirectionalIntegration(props);
            break;
        }
        default:
            throw new Error(
                `Unknown entity type: ${props.node.config.entityType}`
            );
    }
    this.integration.init();
}
