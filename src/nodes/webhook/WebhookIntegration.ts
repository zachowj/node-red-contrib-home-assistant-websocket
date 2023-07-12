import BidirectionalIntegration, {
    DiscoveryBaseMessage,
} from '../../common/integration/BidrectionalIntegration';
import { MessageType } from '../../common/integration/Integration';
import { WebhookNodeProperties } from '.';

export interface WebhookDiscoveryPayload extends DiscoveryBaseMessage {
    type: MessageType.Webhook;
    server_id: string;
    webhook_id: string;
    name: string;
    allowed_methods: string[];
}

export default class WebhookIntegration extends BidirectionalIntegration {
    protected getDiscoveryPayload(
        config: WebhookNodeProperties
    ): WebhookDiscoveryPayload {
        const methods = [
            'method_post',
            'method_get',
            'method_put',
            'method_head',
        ] as const;

        const allowedMethods = methods.reduce((acc, method) => {
            if (config[method]) {
                acc.push(method.replace('method_', '').toUpperCase());
            }
            return acc;
        }, [] as string[]);

        return {
            type: MessageType.Webhook,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            server_id: config.server!,
            webhook_id: config.webhookId,
            name: config.id,
            allowed_methods: allowedMethods,
        };
    }
}
