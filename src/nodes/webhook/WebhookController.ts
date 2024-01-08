import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { NodeMessage } from '../../types/nodes';
import { WebhookNode } from '.';

interface WebhookResponse {
    payload: any;
    headers: Record<string, any>;
    params: Record<string, any>;
}

const ExposeAsController = ExposeAsMixin(OutputController<WebhookNode>);
export default class WebhookController extends ExposeAsController {
    public async onReceivedMessage(data: WebhookResponse) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                data: data.payload,
                headers: data.headers,
                params: data.params,
            },
        );
        this.status.setSuccess('home-assistant.status.received');
        this.node.send(message);
    }
}
