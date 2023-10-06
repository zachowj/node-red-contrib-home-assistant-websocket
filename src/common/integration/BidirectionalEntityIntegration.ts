import { HaEvent } from '../../homeAssistant/index';
import { SubscriptionUnsubscribe } from '../../types/home-assistant';
import State from '../State';
import { createHaConfig } from './helpers';
import { MessageType } from './Integration';
import UnidirectionalEntityIntegration, {
    EntityMessage,
} from './UnidirectionalEntityIntegration';

export interface TriggerPayload {
    // 0 = all, 1 = first, 2 = second etc.
    // comma separated list of numbers is also possible
    output_path: string;
    message: Record<string, unknown>;
}

interface TriggerEvent {
    type: HaEvent.AutomationTriggered;
    data: TriggerPayload;
}

interface StateChangeEvent {
    type: HaEvent.StateChanged;
    state: boolean;
}

export interface ValueChangedEvent {
    type: HaEvent.ValueChange;
    value: number | string;
}

export type HaEventMessage =
    | StateChangeEvent
    | TriggerEvent
    | ValueChangedEvent;

export interface StateChangePayload {
    state: boolean;
    changed: boolean;
}

export default class BidirectionalIntegration extends UnidirectionalEntityIntegration {
    #unsubscribe?: SubscriptionUnsubscribe;

    protected async register() {
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
                status.setFailed('home-assistant.status.error_registering')
            );
            const message = err instanceof Error ? err.message : err;
            this.entityConfigNode.error(
                `Error registering entity. Error Message: ${message}`
            );
            return;
        }
        this.saveHaConfigToContext(haConfig);
        this.status.forEach((status) =>
            status?.setSuccess('home-assistant.status.registered')
        );

        this.registered = true;
    }

    protected async unregister() {
        await this.#unsubscribe?.();
        this.#unsubscribe = undefined;
        await super.unregister();
    }

    public async updateHomeAssistant(state?: string | number | boolean) {
        if (!this.isIntegrationLoaded) return;

        const message: EntityMessage = {
            type: MessageType.Entity,
            server_id: this.entityConfigNode.config.server,
            node_id: this.entityConfigNode.id,
            state: state ?? this.state.isEnabled(),
        };

        try {
            await this.homeAssistant.websocket.send(message);
        } catch (err) {
            this.entityConfigNode.error(
                `Error updating entity. Error Message: ${err}`
            );
        }
    }

    protected onHaEventMessage(evt: HaEventMessage) {
        evt.type ??= HaEvent.StateChanged; // no type prior to 0.20.0
        switch (evt.type) {
            case HaEvent.AutomationTriggered:
                this.entityConfigNode.emit(
                    HaEvent.AutomationTriggered,
                    evt.data
                );
                break;
            case HaEvent.StateChanged: {
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

        const data: Partial<EntityMessage> = {
            state: state.isEnabled(),
        };

        return data;
    }
}
