import Joi from 'joi';

import { HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { EntityConfigNode } from '../../nodes/entity-config';
import { HassEntity, HassStateChangedEvent } from '../../types/home-assistant';
import { BaseNode } from '../../types/nodes';
import Events from '../events/Events';
import { TriggerPayload } from '../integration/BidirectionalEntityIntegration';
import OutputController, {
    OutputControllerConstructor,
} from './OutputController';

interface TriggerEventValidationResult extends TriggerPayload {
    entity: HassEntity;
}

export interface ExposeAsControllerConstructor<T extends BaseNode>
    extends OutputControllerConstructor<T> {
    exposeAsConfigNode?: EntityConfigNode;
    homeAssistant: HomeAssistant;
}

export default abstract class ExposeAsController<
    T extends BaseNode = BaseNode
> extends OutputController<T> {
    protected exposeAsConfigEvents?: Events;
    protected readonly exposeAsConfigNode?: EntityConfigNode;
    protected readonly homeAssistant: HomeAssistant;

    constructor(props: ExposeAsControllerConstructor<T>) {
        super(props);
        this.exposeAsConfigNode = props.exposeAsConfigNode;
        this.homeAssistant = props.homeAssistant;

        if (props.exposeAsConfigNode) {
            const exposeAsConfigEvents = new Events({
                node: this.node,
                emitter: props.exposeAsConfigNode,
            });
            exposeAsConfigEvents.addListener(
                HaEvent.AutomationTriggered,
                this.onTriggered.bind(this)
            );
        }
    }

    get isEnabled(): boolean {
        return this.exposeAsConfigNode?.state?.isEnabled() ?? true;
    }

    protected async validateTriggerMessage(
        data: TriggerPayload
    ): Promise<TriggerEventValidationResult> {
        const schema = Joi.object({
            entity_id: Joi.string().allow(null),
            skip_condition: Joi.boolean().default(false),
            output_path: Joi.boolean().default(true),
        });

        const validatedData = await schema.validateAsync(data);

        const entityId = validatedData.entity_id ?? this.getNodeEntityId();

        if (!entityId) {
            throw new Error(
                'Entity filter type is not set to exact and no entity_id found in trigger data.'
            );
        }

        const entity = this.homeAssistant.websocket.getStates(entityId);

        if (!entity) {
            throw new Error(
                `entity_id provided by trigger event not found in cache: ${entityId}`
            );
        }

        return {
            ...validatedData,
            payload: data.payload,
            entity,
        };
    }

    protected getEventPayload(
        entity: HassEntity
    ): Partial<HassStateChangedEvent> {
        const payload = {
            event_type: 'triggered',
            entity_id: entity.entity_id,
            event: {
                entity_id: entity.entity_id,
                old_state: entity,
                new_state: entity,
            },
        };

        return payload;
    }

    protected getNodeEntityId(): string | undefined {
        return undefined;
    }

    protected abstract onTriggered(data: TriggerPayload): void;

    public getexposeAsConfigEvents(): Events | undefined {
        return this.exposeAsConfigEvents;
    }
}
