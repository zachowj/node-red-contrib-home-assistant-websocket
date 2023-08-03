import OutputController from '../../common/controllers/OutputController';
import { NodeMessage } from '../../types/nodes';
import { SentenceNode } from '.';

interface SentenceResponse {
    sentence: string;
    result: Record<string, unknown>;
}

export default class SentenseController extends OutputController<SentenceNode> {
    public onReceivedMessage(data: SentenceResponse) {
        const message: NodeMessage = {};
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            triggerId: data.sentence,
            results: data.result,
        });
        this.status.setSuccess('home-assistant.status.triggered');
        this.node.send(message);
    }
}
