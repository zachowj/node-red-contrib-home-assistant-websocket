import OutputController from '../../common/controllers/OutputController';
import { NodeMessage } from '../../types/nodes';
import { SentenceNode } from '.';

interface SentenceResponse {
    sentence: string;
}

export default class SentenseController extends OutputController<SentenceNode> {
    public onReceivedMessage(data: SentenceResponse) {
        this.status.setSuccess('home-assistant.status.triggered');
        const message: NodeMessage = {};
        try {
            this.setCustomOutputs(this.node.config.outputProperties, message, {
                config: this.node.config,
                triggerId: data.sentence,
            });
        } catch (e) {
            this.node.error(e);
            this.status.setFailed('home-assistant.status.error');
            return;
        }
        this.node.send(message);
    }
}
