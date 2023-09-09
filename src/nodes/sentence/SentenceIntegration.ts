import BidirectionalIntegration, {
    DiscoveryMessage,
} from '../../common/integration/BidrectionalIntegration';
import { MessageType } from '../../common/integration/Integration';
import { SentenceNode } from '.';

export interface SentenceDiscoveryPayload extends DiscoveryMessage {
    type: MessageType.SentenceTrigger;
    sentences: string[];
    response?: string;
}

export default class SentenceIntegration extends BidirectionalIntegration<SentenceNode> {
    protected getDiscoveryPayload(): SentenceDiscoveryPayload {
        const response =
            this.node.config.response === ''
                ? undefined
                : this.node.config.response;
        return {
            type: MessageType.SentenceTrigger,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            server_id: this.node.config.server!,
            sentences: this.node.config.sentences,
            response,
        };
    }
}
