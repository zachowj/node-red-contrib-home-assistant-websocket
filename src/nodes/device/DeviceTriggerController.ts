import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { Provides } from '../../common/services/TypedInputService';
import { NodeMessage } from '../../types/nodes';
import { DeviceNode } from '.';

interface DeviceTriggerEvent {
    description: string;
}

const ExposeAsController = ExposeAsMixin(
    OutputController<DeviceNode, Provides<'eventData' | 'triggerId'>>,
);
export default class DeviceTriggerController extends ExposeAsController {
    public async onTrigger(data: DeviceTriggerEvent) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                eventData: data,
                triggerId: this.node.config.device,
            },
        );

        this.status.setSuccess(data.description);
        this.node.send(message);
    }
}
