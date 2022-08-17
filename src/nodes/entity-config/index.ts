import { HassExposedConfig } from '../../editor/types';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import EntityConfig from '../../nodes/entity-config/controller';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';

export interface EntityConfigNodeProperties extends BaseNodeProperties {
    entityType: string;
    server: string;
    haConfig: HassExposedConfig[];
}

export type EntityConfigNode = BaseNode;

export default function entityConfigNode(
    this: EntityConfigNode,
    config: EntityConfigNodeProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    this.controller = new EntityConfig({
        node: this,
        config: this.config,
    });
}
