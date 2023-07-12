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

interface BidirectionalIntegrationConstructor extends IntegrationConstructor {
    node: BaseNode;
}

export default abstract class BidirectionalIntegration extends Integration {
    #unsubscribe?: SubscriptionUnsubscribe;

    protected readonly node: BaseNode;

    constructor(props: BidirectionalIntegrationConstructor) {
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

        const payload = this.getDiscoveryPayload(this.node.config);

        this.debugToClient('register', payload);

        try {
            this.#unsubscribe =
                await this.homeAssistant.websocket.subscribeMessage(
                    this.onReceivedMessage.bind(this),
                    this.getDiscoveryPayload(this.node.config),
                    { resubscribe: false }
                );
        } catch (err) {
            this.status.forEach((status) =>
                status.setFailed('Error registering')
            );
            const message = err instanceof Error ? err.message : err;
            this.node.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }

        this.status.forEach((status) => status?.setSuccess('Registered'));
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

    protected abstract getDiscoveryPayload(
        config: Record<string, any>
    ): DiscoveryBaseMessage;

    protected debugToClient(topic: string, message: any) {
        debugToClient(this.node, message, topic);
    }
}
