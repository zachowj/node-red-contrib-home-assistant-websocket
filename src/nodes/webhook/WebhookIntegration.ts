import BidirectionalIntegration, {
    DiscoveryMessage,
} from '../../common/integration/BidrectionalIntegration';
import { MessageType } from '../../common/integration/Integration';
import { WebhookNode } from '.';

export interface WebhookDiscoveryPayload extends DiscoveryMessage {
    type: MessageType.Webhook;
    server_id: string;
    webhook_id: string;
    name: string;
    allowed_methods: string[];
}

export default class WebhookIntegration extends BidirectionalIntegration<WebhookNode> {
    protected getDiscoveryPayload(): WebhookDiscoveryPayload {
        const methods = [
            'method_post',
            'method_get',
            'method_put',
            'method_head',
        ] as const;

        const allowedMethods = methods.reduce((acc, method) => {
            if (this.node.config[method]) {
                acc.push(method.replace('method_', '').toUpperCase());
            }
            return acc;
        }, [] as string[]);

        return {
            type: MessageType.Webhook,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            server_id: this.node.config.server!,
            webhook_id: this.node.config.webhookId,
            name: this.node.config.id,
            allowed_methods: allowedMethods,
        };
    }
}
