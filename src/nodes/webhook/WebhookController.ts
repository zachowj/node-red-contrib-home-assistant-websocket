import OutputController, {
    OutputControllerOptions,
} from '../../common/controllers/OutputController';
import { IntegrationEvent } from '../../common/integration/Integration';
import { NodeMessage } from '../../types/nodes';
import { WebhookNode } from '.';

interface WebhookResponse {
    payload: any;
    headers: Record<string, any>;
    params: Record<string, any>;
}

type WebhookNodeOptions = OutputControllerOptions<WebhookNode>;

export default class WebhookController extends OutputController<WebhookNode> {
    constructor(props: WebhookNodeOptions) {
        super(props);

        this.node.addListener(
            IntegrationEvent.Trigger,
            this.#onReceivedMessage.bind(this)
        );
    }

    #onReceivedMessage(data: WebhookResponse) {
        const message: NodeMessage = {};
        try {
            this.setCustomOutputs(this.node.config.outputProperties, message, {
                config: this.node.config,
                data: data.payload,
                headers: data.headers,
                params: data.params,
            });
        } catch (e) {
            this.node.error(e);
            this.status.setFailed('error');
            return;
        }

        this.status.setSuccess('home-assistant.status.received');
        this.node.send(message);
    }
}
