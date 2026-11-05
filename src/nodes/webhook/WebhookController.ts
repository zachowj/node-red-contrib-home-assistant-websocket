import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { Provides } from '../../common/services/TypedInputService';
import { NodeMessage } from '../../types/nodes';
import { WebhookNode } from '.';

interface WebhookResponse {
    payload: any;
    headers: Record<string, any>;
    params: Record<string, any>;
}

const ExposeAsController = ExposeAsMixin(
    OutputController<WebhookNode, Provides<'data' | 'headers' | 'params'>>,
);
export default class WebhookController extends ExposeAsController {
    public async onReceivedMessage(data: WebhookResponse) {
        if (!this.isEnabled) return;

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                data: data.payload,
                headers: data.headers,
                params: data.params,
            },
        );
        this.status.setSuccess('home-assistant.status.received');
        this.node.send(message);
    }
}
