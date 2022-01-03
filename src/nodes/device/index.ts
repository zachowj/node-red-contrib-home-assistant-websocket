import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { EventsStatus, Status } from '../../helpers/status';
import { migrate } from '../../migrations';
import { DeviceNode } from '../../types/nodes';
import DeviceAction from './action-controller';
import DeviceTrigger from './trigger-controller';

export default function deviceNode(this: DeviceNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const params = {
        node: this,
        config: this.config,
        RED,
    };
    switch (this.config.deviceType) {
        case 'action': {
            const status = new Status(this);
            this.controller = new DeviceAction({ ...params, status });
            break;
        }
        case 'trigger': {
            const status = new EventsStatus(this);
            this.controller = new DeviceTrigger({ ...params, status });
            break;
        }
        default:
            this.status({ text: 'Error' });
            throw new Error(`Invalid entity type: ${this.config.deviceType}`);
    }
}
