import BidirectionalIntegration, {
    DiscoveryBaseMessage,
} from '../../common/integration/BidrectionalIntegration';
import { MessageType } from '../../common/integration/Integration';
import { SentenceNodeProperties } from '.';

export interface SentenceDiscoveryPayload extends DiscoveryBaseMessage {
    type: MessageType.SentenseTrigger;
    sentences: string[];
}

export default class SentenceIntegration extends BidirectionalIntegration {
    protected getDiscoveryPayload(
        config: SentenceNodeProperties
    ): SentenceDiscoveryPayload {
        return {
            type: MessageType.SentenseTrigger,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            server_id: config.server!,
            sentences: config.sentences,
        };
    }
}
