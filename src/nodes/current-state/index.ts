import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { Status } from '../../helpers/status';
import { BaseNode } from '../../types/nodes';
import CurrentState from './controller';

export default function currentStateNode(this: BaseNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const status = new Status(this);
    this.controller = new CurrentState({
        node: this,
        config: this.config,
        RED,
        status,
    });
}
