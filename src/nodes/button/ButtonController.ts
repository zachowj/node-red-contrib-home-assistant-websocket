import OutputController, {
    OutputControllerOptions,
} from '../../common/controllers/OutputController';
import Events from '../../common/events/Events';
import { HassEntity } from '../../types/home-assistant';
import { ButtonNode } from '.';

type ButtonNodeOptions = OutputControllerOptions<ButtonNode> & {
    entityEvents: Events;
};

export default class ButtonController extends OutputController<ButtonNode> {
    constructor(props: ButtonNodeOptions) {
        super(props);
        props.entityEvents.addListener('triggered', this.onTrigger.bind(this));
    }

    onTrigger(data: { entity: HassEntity }) {
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
