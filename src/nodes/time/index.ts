import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { EventsStatus } from '../../helpers/status';
import { BaseNode } from '../../types/nodes';
import Time from './controller';

export default function timeNode(this: BaseNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const status = new EventsStatus(this);
    this.controller = new Time({
        node: this,
        config: this.config,
        RED,
        status,
    });
}
