import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { NodeMessage } from '../../types/nodes';
import { DeviceNode } from '.';

interface DeviceTriggerEvent {
    description: string;
}

const ExposeAsController = ExposeAsMixin(OutputController<DeviceNode>);
export default class DeviceTriggerController extends ExposeAsController {
    public async onTrigger(data: DeviceTriggerEvent) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                eventData: data,
                triggerId: this.node.config.device,
            },
        );

        this.status.setSuccess(data.description);
        this.node.send(message);
    }
}
