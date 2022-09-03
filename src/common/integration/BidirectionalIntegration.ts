import { RED } from '../../globals';
import { HaEvent } from '../../homeAssistant/index';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import { createHaConfig } from './helpers';
import Integration, { EntityMessage, MessageType } from './Integration';

export default class BidirectionalIntegration extends Integration {
    #unsubscribe?: SubscriptionUnsubscribe;

    protected async registerEntity() {
        if (!this.isIntegrationLoaded || this.isRegistered) {
            return;
        }

        const haConfig = createHaConfig(this.entityConfigNode.config.haConfig);

        try {
            const payload = this.getDiscoveryPayload({
                config: haConfig,
            });
            this.entityConfigNode.debug(
                `Registering ${this.entityConfigNode.config.entityType} node with Home Assistant`
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
            this.entityConfigNode.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }

        this.status.forEach((status) =>
            status?.setSuccess(RED._('config-server.status.registered'))
        );

        this.registered = true;
    }

    protected async unregisterEntity() {
        this.entityConfigNode.debug(
            `Unregistering ${this.entityConfigNode.config.entityType} node from HA`
        );

        this.#unsubscribe?.();
        this.#unsubscribe = undefined;
    }

    protected updateHomeAssistant() {
        if (!this.isIntegrationLoaded) return;

        const message: EntityMessage = {
            type: MessageType.Entity,
            server_id: this.entityConfigNode.config.server,
            node_id: this.entityConfigNode.id,
            state: this.state.isEnabled,
        };

        this.homeAssistant.websocket.send(message);
    }

    protected onHaEventMessage(evt: { type?: HaEvent; data: any }) {
        switch (evt.type) {
            case HaEvent.AutomationTriggered:
                this.entityConfigNode.emit(
                    HaEvent.AutomationTriggered,
                    evt.data
                );
                break;
            case HaEvent.StateChanged:
            default: // no type prior to 0.20.0
                this.state.setEnabled(evt.data.state);
                this.updateHomeAssistant();
                break;
        }
    }
}
