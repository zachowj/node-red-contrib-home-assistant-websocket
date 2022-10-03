import { EntityType } from '../../const';
import { RED } from '../../globals';
import { HaEvent } from '../../homeAssistant/index';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import State from '../State';
import { createHaConfig } from './helpers';
import { MessageType } from './Integration';
import Integration, { EntityMessage } from './UnidirectionalEntityIntegration';

export interface TriggerPayload {
    entity_id?: string;
    skip_condition: boolean;
    output_path: boolean;
    payload?: boolean | string | number | Record<string, unknown>;
}

interface TriggerEvent {
    type: HaEvent.AutomationTriggered;
    data: TriggerPayload;
}

interface StateChangeEvent {
    type: HaEvent.StateChanged;
    state: boolean;
}

export interface StateChangePayload {
    state: boolean;
    changed: boolean;
}

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
                state: this.state,
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

    public async updateHomeAssistant() {
        if (!this.isIntegrationLoaded) return;

        const message: EntityMessage = {
            type: MessageType.Entity,
            server_id: this.entityConfigNode.config.server,
            node_id: this.entityConfigNode.id,
            state: this.state.isEnabled(),
        };

        await this.homeAssistant.websocket.send(message);
    }

    protected onHaEventMessage(evt: TriggerEvent | StateChangeEvent) {
        switch (evt.type) {
            case HaEvent.AutomationTriggered:
                this.entityConfigNode.emit(
                    HaEvent.AutomationTriggered,
                    evt.data
                );
                break;
            case HaEvent.StateChanged:
            default: {
                // no type prior to 0.20.0
                const previousState = this.state.isEnabled();
                this.state.setEnabled(evt.state);
                this.entityConfigNode.emit(HaEvent.StateChanged, {
                    state: evt.state,
                    changed: evt.state !== previousState,
                });
                this.updateHomeAssistant();
                break;
            }
        }
    }

    protected getStateData(state?: State): Partial<EntityMessage> {
        if (!state) {
            return {};
        }

        const data: Partial<EntityMessage> = {};

        switch (this.entityConfigNode.config.entityType) {
            case EntityType.Switch:
                data.state = state.isEnabled();
                break;
        }

        return data;
    }
}
