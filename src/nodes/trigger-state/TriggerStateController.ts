import { cloneDeep } from 'lodash';
import selectn from 'selectn';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import InputOutputController, {
    InputOutputControllerOptions,
} from '../../common/controllers/InputOutputController';
import ConfigError from '../../common/errors/ConfigError';
import ComparatorService from '../../common/services/ComparatorService';
import State from '../../common/State';
import TransformState from '../../common/TransformState';
import { isRecord } from '../../helpers/assert';
import { renderTemplate } from '../../helpers/mustache';
import { containsMustache, shouldIncludeEvent } from '../../helpers/utils';
import { HaEvent } from '../../homeAssistant';
import {
    DeepReadonly,
    HassEntity,
    HassStateChangedEvent,
} from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { TriggerStateNode, TriggerStateProperties } from '.';
import {
    ComparatorPropertyType,
    Constraint,
    CustomOutput,
    ENABLE,
    MessageType,
    PropertyType,
    TargetType,
} from './const';

interface DefaultMessage extends NodeMessage {
    topic: string;
    payload: unknown;
    data: Record<string, unknown>;
    failedComparators?: any[];
}

interface CustomOutputsComparatorResult {
    output: CustomOutput;
    comparatorMatched: boolean;
    actualValue: unknown;
    message: Record<string, unknown> | null;
}

interface TriggerEvent {
    entity_id: string;
    new_state: DeepReadonly<HassEntity> | null;
    old_state: DeepReadonly<HassEntity> | null;
}

interface TargetData {
    entityId: string;
    state: DeepReadonly<HassEntity> | TriggerEvent;
}

interface ComparatorResult {
    constraint: Constraint;
    constraintTarget: TargetData;
    actualValue: unknown;
    comparatorResult: boolean;
}

export interface TriggerStateControllerConstructor extends InputOutputControllerOptions<
    TriggerStateNode,
    TriggerStateProperties
> {
    comparatorService: ComparatorService;
    state?: State;
    transformState: TransformState;
}

const ExposeAsController = ExposeAsMixin(
    InputOutputController<TriggerStateNode, TriggerStateProperties>,
);
export default class TriggerStateController extends ExposeAsController {
    #comparatorService: ComparatorService;
    #state?: State;
    #transformState: TransformState;

    constructor(props: TriggerStateControllerConstructor) {
        super(props);
        this.#comparatorService = props.comparatorService;
        this.#state = props.state;
        this.#transformState = props.transformState;
    }

    get isEnabled(): boolean {
        if (this.exposeAsConfigNode) {
            return super.isEnabled;
        }

        return this.#state?.isEnabled() ?? true;
    }

    #selectValue(path: string, source: unknown, castState: boolean) {
        const value = selectn(path, source);
        if (
            castState &&
            typeof value === 'string' &&
            (path === 'new_state.state' || path === 'old_state.state')
        ) {
            return this.#transformState.transform(
                this.node.config.stateType,
                value,
            );
        }
        return value;
    }

    async #getConstraintComparatorResults(
        constraints: Constraint[],
        eventMessage: DeepReadonly<HassStateChangedEvent>,
    ) {
        const comparatorResults: ComparatorResult[] = [];

        // Check constraints
        for (const constraint of constraints) {
            const {
                comparatorType,
                comparatorValue,
                comparatorValueDatatype,
                propertyValue,
            } = constraint;
            const constraintTarget = this.#getConstraintTargetData(
                constraint,
                eventMessage.event,
            );
            const actualValue = this.#selectValue(
                constraint.propertyValue,
                constraintTarget.state,
                constraint.targetType === TargetType.ThisEntity,
            );
            const comparatorResult =
                await this.#comparatorService.getComparatorResult(
                    comparatorType,
                    comparatorValue,
                    actualValue,
                    comparatorValueDatatype,
                    {
                        entity: eventMessage.event.new_state,
                        prevEntity: eventMessage.event.old_state,
                    },
                );
            if (comparatorResult === false) {
                this.debugToClient(
                    `constraint comparator: failed entity "${constraintTarget.entityId}" property "${propertyValue}" with value ${actualValue} failed "${comparatorType}" check against (${comparatorValueDatatype}) ${comparatorValue}`,
                );
            }

            comparatorResults.push({
                constraint,
                constraintTarget,
                actualValue,
                comparatorResult,
            });
        }
        const failedComparators = comparatorResults.filter(
            (res) => !res.comparatorResult,
        );
        return {
            all: comparatorResults,
            failed: failedComparators,
        };
    }

    #getConstraintTargetData(
        constraint: Constraint,
        triggerEvent: TriggerEvent,
    ) {
        const isTargetThisEntity =
            constraint.targetType === TargetType.ThisEntity;
        const entityId = isTargetThisEntity
            ? triggerEvent.entity_id
            : constraint.targetValue;
        const entity = isTargetThisEntity
            ? triggerEvent
            : (this.homeAssistant.websocket.getState(
                  entityId,
              ) as DeepReadonly<HassEntity>);

        if (entity === null) {
            throw new ConfigError([
                'trigger-state.error.entity_id_not_found',
                { entity_id: entityId },
            ]);
        }

        const targetData: TargetData = {
            entityId,
            state: entity,
        };

        if (
            !isTargetThisEntity &&
            constraint.propertyType === PropertyType.CurrentState
        ) {
            targetData.state = {
                entity_id: entityId,
                old_state: null,
                new_state: this.homeAssistant.websocket.getState(
                    entityId,
                ) as DeepReadonly<HassEntity>,
            };
        }

        return targetData;
    }

    async #getCustomOutputsComparatorResults(
        outputs: CustomOutput[],
        eventMessage: DeepReadonly<HassStateChangedEvent>,
    ): Promise<CustomOutputsComparatorResult[]> {
        return outputs.reduce(
            async (acc, output) => {
                const result: CustomOutputsComparatorResult = {
                    output,
                    comparatorMatched: true,
                    actualValue: null,
                    message: null,
                };

                if (
                    output.comparatorPropertyType !==
                    ComparatorPropertyType.Always
                ) {
                    result.actualValue = this.#selectValue(
                        output.comparatorPropertyValue,
                        eventMessage.event,
                        true,
                    );
                    result.comparatorMatched =
                        await this.#comparatorService.getComparatorResult(
                            output.comparatorType,
                            output.comparatorValue,
                            result.actualValue,
                            output.comparatorValueDataType,
                            {
                                entity: eventMessage.event.new_state,
                                prevEntity: eventMessage.event.old_state,
                            },
                        );
                }
                result.message = await this.#getOutputMessage(
                    result,
                    eventMessage,
                );
                return [...(await acc), result];
            },
            Promise.resolve([]) as Promise<CustomOutputsComparatorResult[]>,
        );
    }

    #getDefaultMessageOutputs(
        comparatorResults: any,
        eventMessage: DeepReadonly<HassStateChangedEvent>,
    ) {
        const { entity_id: entityId, event } = eventMessage;

        // Messages go to the user, so they get their own copy of the readonly data
        const msg: DefaultMessage = {
            topic: entityId,
            payload: structuredClone(event.new_state?.state),
            data: structuredClone(eventMessage) as Record<string, unknown>,
        };
        let outputs;

        if (comparatorResults.failed.length) {
            this.debugToClient(
                'constraint comparator: one or more comparators failed to match constraints, message will send on the failed output',
            );

            msg.failedComparators = cloneDeep(comparatorResults.failed);
            outputs = [null, msg];
        } else {
            outputs = [msg, null];
        }
        return outputs;
    }

    async #getOutputMessage(
        {
            output,
            comparatorMatched,
            actualValue,
        }: CustomOutputsComparatorResult,
        eventMessage: DeepReadonly<HassStateChangedEvent>,
    ): Promise<Record<string, unknown> | null> {
        // If comparator did not match
        if (!comparatorMatched) {
            this.debugToClient(
                `output comparator failed: property "${output.comparatorPropertyValue}" with value ${actualValue} failed "${output.comparatorType}" check against (${output.comparatorValueDataType}) ${output.comparatorValue}`,
            );
            return null;
        }

        let message: Record<string, unknown> = {
            topic: eventMessage.entity_id,
            payload: structuredClone(eventMessage.event.new_state?.state),
            data: structuredClone(eventMessage) as Record<string, unknown>,
        };

        if (
            output.messageType === MessageType.Custom ||
            output.messageType === MessageType.Payload
        ) {
            let payload = output.messageValue;
            // Render Template Variables
            if (containsMustache(output.messageValue)) {
                payload = renderTemplate(
                    output.messageValue,
                    eventMessage.event as NodeMessage,
                    this.node.context(),
                    this.homeAssistant.websocket.getStates(),
                );
            }

            payload = await this.typedInputService.getValue(
                payload,
                output.messageValueType,
                {
                    eventData: eventMessage,
                },
            );

            if (output.messageType === MessageType.Custom) {
                if (!isRecord(payload)) {
                    throw new ConfigError(
                        'trigger-state.error.custom_output_message_needs_to_be_object',
                    );
                }
                message = cloneDeep(payload);
            } else {
                message = {
                    payload: cloneDeep(payload),
                };
            }
        }

        return message;
    }

    public onInputEnabled(message: NodeMessage): boolean {
        const enable = message.payload === ENABLE;
        this.#state?.setEnabled(enable);
        this.enableExposeAs(enable);
        return true;
    }

    public onInputTesting(message: NodeMessage): boolean {
        const {
            entity_id: entityId,
            new_state: newState,
            old_state: oldState,
        } = message.payload as TriggerEvent;
        if (entityId && newState && oldState) {
            const evt = {
                event_type: HaEvent.StateChanged,
                entity_id: entityId,
                event: message.payload,
            };

            this.onEntityStateChanged(evt as HassStateChangedEvent);
        }
        return true;
    }

    public async onEntityStateChanged(
        evt: DeepReadonly<HassStateChangedEvent>,
    ) {
        if (
            this.isEnabled === false ||
            !this.homeAssistant.isHomeAssistantRunning
        ) {
            return;
        }

        if (!evt.event.new_state) {
            return;
        }

        // Check if the entity_id is in the list of entities to watch
        const valid = Object.entries(this.node.config.entities).some(
            ([type, ids]) => {
                return ids?.some((id) =>
                    shouldIncludeEvent(evt.entity_id, id, type),
                );
            },
        );

        // If the entity_id is not in the list of entities to watch, return
        if (!valid) {
            return;
        }

        const eventMessage = evt;

        const constraintComparatorResults =
            await this.#getConstraintComparatorResults(
                this.node.config.constraints,
                eventMessage,
            );

        let outputs: (DefaultMessage | Record<string, unknown> | null)[] =
            this.#getDefaultMessageOutputs(
                constraintComparatorResults,
                eventMessage,
            );

        const stateString =
            eventMessage.event.new_state?.state.toString() ?? '';
        // If a constraint comparator failed we're done, also if no custom outputs to look at
        if (
            constraintComparatorResults.failed.length ||
            !this.node.config.customOutputs.length
        ) {
            if (constraintComparatorResults.failed.length) {
                this.status.setFailed(stateString);
            } else {
                this.status.setSuccess(stateString);
            }
            this.debugToClient(`done processing sending messages:`);
            this.debugToClient(outputs);

            this.node.send(outputs);
            return;
        }

        const customOutputsComparatorResults =
            await this.#getCustomOutputsComparatorResults(
                this.node.config.customOutputs,
                eventMessage,
            );
        const customOutputMessages = customOutputsComparatorResults.map(
            (r) => r.message,
        );

        outputs = outputs.concat(customOutputMessages);
        this.debugToClient(`done processing sending messages: ${outputs}`);
        this.status.setSuccess(stateString);
        this.node.send(outputs);
    }
}
