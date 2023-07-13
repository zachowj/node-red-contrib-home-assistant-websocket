import OutputController, {
    OutputControllerOptions,
} from '../../common/controllers/OutputController';
import { IntegrationEvent } from '../../common/integration/Integration';
import { NodeMessage } from '../../types/nodes';
import { SentenceNode } from '.';

interface SentenceResponse {
    sentence: string;
}

type SentenceNodeOptions = OutputControllerOptions<SentenceNode>;

export default class SentenseController extends OutputController<SentenceNode> {
    constructor(props: SentenceNodeOptions) {
        super(props);

        this.node.addListener(
            IntegrationEvent.Trigger,
            this.#onReceivedMessage.bind(this)
        );
    }

    #onReceivedMessage(data: SentenceResponse) {
        this.status.setSuccess('home-assistant.status.triggered');
        const message: NodeMessage = {};
        try {
            this.setCustomOutputs(this.node.config.outputProperties, message, {
                config: this.node.config,
                triggerId: data.sentence,
            });
        } catch (e) {
            this.node.error(e);
            this.status.setFailed('error');
            return;
        }
        this.node.send(message);
    }
}
