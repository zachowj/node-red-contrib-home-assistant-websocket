import { RED } from '../../globals';
import { Status } from '../../helpers/status';
import { migrate } from '../../migrations';
import { EntityNode, EntityNodeDef } from '../../types/nodes';
import ButtonController from './controller';

export default function buttonNode(this: EntityNode, config: EntityNodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const status = new Status(this);
    this.controller = new ButtonController({
        node: this,
        config: this.config,
        status,
    });
}
