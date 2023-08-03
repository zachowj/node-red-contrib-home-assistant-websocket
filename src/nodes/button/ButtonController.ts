import OutputController from '../../common/controllers/OutputController';
import { HassEntity } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { ButtonNode } from '.';

export default class ButtonController extends OutputController<ButtonNode> {
    public onTrigger(data: { entity: HassEntity }) {
        const message: NodeMessage = {};
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            entity: data.entity,
            entityState: data.entity.state,
            triggerId: data.entity.entity_id,
        });
        this.status.setSuccess('home-assistant.status.pressed');
        this.node.send(message);
    }
}
