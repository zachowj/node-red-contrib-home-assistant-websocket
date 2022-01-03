import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { EventsStatus } from '../../helpers/status';
import { migrate } from '../../migrations';
import { BaseNode } from '../../types/nodes';
import Tag from './controller';

export default function tagNode(this: BaseNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const status = new EventsStatus(this);
    this.controller = new Tag({
        node: this,
        config: this.config,
        RED,
        status,
    });
}
