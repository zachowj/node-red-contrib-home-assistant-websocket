import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { migrate } from '../../migrations';
import EntityConfig from '../../nodes/entity-config/controller';
import { BaseNode } from '../../types/nodes';

export default function entityConfigNode(
    this: BaseNode & {
        entityType: string;
    },
    config: NodeDef
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    this.controller = new EntityConfig({
        node: this,
        config: this.config,
    });
}
