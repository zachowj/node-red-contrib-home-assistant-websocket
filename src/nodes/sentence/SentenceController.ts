import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { NodeMessage } from '../../types/nodes';
import { SentenceNode } from '.';
import { TypedInputTypes } from '../../const';

interface SentenceResponse {
    sentence: string;
    result: Record<string, unknown> | null;
    deviceId: string | null;
}

const ExposeAsController = ExposeAsMixin(OutputController<SentenceNode>);
export default class SentenseController extends ExposeAsController {
    public async onReceivedMessage(data: SentenceResponse) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                [TypedInputTypes.Config]: this.node.config,
                [TypedInputTypes.TriggerId]: data.sentence,
                [TypedInputTypes.Results]: data.result,
                [TypedInputTypes.DeviceId]: data.deviceId,
            },
        );
        this.status.setSuccess('home-assistant.status.triggered');
        this.node.send(message);
    }
}
