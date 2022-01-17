import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { Status } from '../../helpers/status';
import { BaseNode } from '../../types/nodes';
import WaitUntil from './controller';

export default function waitUntilNode(this: BaseNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const status = new Status(this);
    this.controller = new WaitUntil({
        node: this,
        config: this.config,
        RED,
        status,
    });
}
