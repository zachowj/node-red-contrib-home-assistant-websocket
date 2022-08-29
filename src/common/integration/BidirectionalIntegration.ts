import { RED } from '../../globals';
import { HaEvent } from '../../homeAssistant/index';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import { createHaConfig } from './helpers';
import Integration, { EntityMessage, MessageType } from './Integration';

export default class BidirectionalIntegration extends Integration {
    #unsubscribe?: SubscriptionUnsubscribe;

    async onClose(removed: boolean, done: () => void) {
        this.#unsubscribe?.();
        this.#unsubscribe = undefined;
        super.onClose(removed, done);
    }

    protected async registerEntity() {
        if (!this.isIntegrationLoaded || this.isRegistered) {
            return;
        }

        const haConfig = createHaConfig(this.node.config.haConfig);

        try {
            const payload = this.getDiscoveryPayload({
                config: haConfig,
            });
            this.node.debug(
                `Registering ${this.node.config.entityType} node with Home Assistant`
            );
            this.#unsubscribe =
                await this.homeAssistant.websocket.subscribeMessage(
                    this.onHaEventMessage.bind(this),
                    payload,
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

        this.status.forEach((status) =>
            status?.setSuccess(RED._('config-server.status.registered'))
        );

        this.registered = true;
    }

    protected updateHomeAssistant() {
        if (!this.isIntegrationLoaded) return;

        const message: EntityMessage = {
            type: MessageType.Entity,
            server_id: this.node.config.server,
            node_id: this.node.id,
            state: this.state.isEnabled,
        };

        this.homeAssistant.websocket.send(message);
    }

    protected onHaEventMessage(evt: { type?: HaEvent; data: any }) {
        switch (evt.type) {
            case HaEvent.AutomationTriggered:
                this.node.emit(HaEvent.AutomationTriggered, evt.data);
                break;
            case HaEvent.StateChanged:
            default: // no type prior to 0.20.0
                this.state.setEnabled(evt.data.state);
                this.updateHomeAssistant();
                break;
        }
    }
}
