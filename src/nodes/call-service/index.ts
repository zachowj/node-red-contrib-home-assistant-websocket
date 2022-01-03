import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { Status } from '../../helpers/status';
import { migrate } from '../../migrations';
import { BaseNode } from '../../types/nodes';
import CallService from './controller';

export default function callServiceNode(this: BaseNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const status = new Status(this);
    this.controller = new CallService({
        node: this,
        config: this.config,
        RED,
        status,
    });
}
