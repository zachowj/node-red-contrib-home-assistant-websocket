import BidirectionalIntegration, {
    DiscoveryMessage,
} from '../../common/integration/BidrectionalIntegration';
import { MessageType } from '../../common/integration/Integration';
import { SentenceNode } from '.';
import { SentenceResponseType } from './const';

export interface SentenceDiscoveryPayload extends DiscoveryMessage {
    type: MessageType.SentenceTrigger;
    sentences: string[];
    response?: string;
    response_type?: SentenceResponseType;
    response_timeout?: number;
}

export default class SentenceIntegration extends BidirectionalIntegration<SentenceNode> {
    protected getDiscoveryPayload(): SentenceDiscoveryPayload {
        const response =
            this.node.config.triggerResponse === ''
                ? undefined
                : this.node.config.triggerResponse;

        // set the timeout to 1000 milliseconds if not set and convert to seconds
        const timeout = (this.node.config.responseTimeout ?? 1000) / 1000;

        return {
            type: MessageType.SentenceTrigger,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            server_id: this.node.config.server!,
            sentences: this.node.config.sentences,
            response,
            response_type: this.node.config.triggerResponseType,
            response_timeout: timeout,
        };
    }
}
