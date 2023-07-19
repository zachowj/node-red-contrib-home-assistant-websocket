import OutputController from '../../common/controllers/OutputController';
import { HassEntity } from '../../types/home-assistant';
import { ButtonNode } from '.';

export default class ButtonController extends OutputController<ButtonNode> {
    public onTrigger(data: { entity: HassEntity }) {
        this.status.setSuccess('home-assistant.status.pressed');
        const message = {};
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            entity: data.entity,
            entityState: data.entity.state,
            triggerId: data.entity.entity_id,
        });
        this.node.send(message);
    }
}
