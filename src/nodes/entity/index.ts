import { NodeDef } from 'node-red';

import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { Status, SwitchEntityStatus } from '../../helpers/status';
import { BaseNode, BaseNodeConfig } from '../../types/nodes';
import Sensor from './sensor-controller';
import Switch from './switch-controller';

interface EntityNode extends BaseNode {
    config: BaseNodeConfig & {
        entityType: string;
    };
}

export default function entityNode(this: EntityNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    switch (this.config.entityType) {
        case 'binary_sensor':
        case 'sensor': {
            const status = new Status(this);
            this.controller = new Sensor({
                node: this,
                config: this.config,
                RED,
                status,
            });

            break;
        }
        case 'switch': {
            const status = new SwitchEntityStatus(this);
            this.controller = new Switch({
                node: this,
                config: this.config,
                RED,
                status,
            });
            break;
        }
        default:
            this.status({ text: 'Error' });
            throw new Error(`Invalid entity type: ${this.config.entityType}`);
    }
}
