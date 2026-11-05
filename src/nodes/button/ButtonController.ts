import OutputController from '../../common/controllers/OutputController';
import { Provides } from '../../common/services/TypedInputService';
import { DeepReadonly, HassEntity } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { ButtonNode } from '.';

export default class ButtonController extends OutputController<
    ButtonNode,
    Provides<'entity' | 'triggerId'>
> {
    public async onTrigger(data: { entity: DeepReadonly<HassEntity> }) {
        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                entity: data.entity,
                triggerId: data.entity.entity_id,
            },
        );
        this.status.setSuccess('home-assistant.status.pressed');
        this.node.send(message);
    }
}
