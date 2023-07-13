import { debugToClient } from '../../helpers/node';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import { BaseNode, NodeDone } from '../../types/nodes';
import { NodeEvent } from '../events/Events';
import Integration, {
    IntegrationConstructor,
    IntegrationEvent,
    MessageType,
} from './Integration';

export interface DiscoveryBaseMessage {
    type: MessageType;
    server_id: string;
}

export interface ReceivedMessage {
    data: Record<string, any>;
}

interface BidirectionalIntegrationConstructor<T extends BaseNode>
    extends IntegrationConstructor {
    node: T;
}

export default abstract class BidirectionalIntegration<
    T extends BaseNode
> extends Integration {
    #unsubscribe?: SubscriptionUnsubscribe;

    protected readonly node: T;

    constructor(props: BidirectionalIntegrationConstructor<T>) {
        super(props);

        this.node = props.node;
        this.node.on(NodeEvent.Close, this.onNodeClose.bind(this));
    }

    protected async register(): Promise<void> {
        if (!this.isIntegrationLoaded) {
            this.node.error(this.notInstalledMessage);
            this.status.forEach((status) =>
                status.setFailed('home-assistant.status.error')
            );
            return;
        }

        if (this.isRegistered) return;

        const payload = this.getDiscoveryPayload();

        this.debugToClient('register', payload);

        try {
            this.#unsubscribe =
                await this.homeAssistant.websocket.subscribeMessage(
                    this.onReceivedMessage.bind(this),
                    payload,
                    { resubscribe: false }
                );
        } catch (err) {
            this.status.forEach((status) =>
                status.setFailed('home-assistant.status.error_registering')
            );
            const message = err instanceof Error ? err.message : err;
            this.node.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }

        this.status.forEach((status) =>
            status?.setSuccess('home-assistant.status.registered')
        );
        this.registered = true;
    }

    protected async unregister(): Promise<void> {
        await this.#unsubscribe?.();
    }

    protected async onNodeClose(removed: boolean, done: NodeDone) {
        this.registered = false;
        if (this.isIntegrationLoaded) {
            try {
                await this.unregister();
            } catch (err) {
                done(err as Error);
            }
        }
        done();
    }

    protected onReceivedMessage(message: ReceivedMessage) {
        this.node.emit(IntegrationEvent.Trigger, message.data);
    }

    protected abstract getDiscoveryPayload(): DiscoveryBaseMessage;

    protected debugToClient(topic: string, message: any) {
        debugToClient(this.node, message, topic);
    }
}
