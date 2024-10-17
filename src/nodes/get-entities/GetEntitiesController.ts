import { shuffle } from 'lodash';
import selectn from 'selectn';

import { PropertySelectorType } from '../../common/const';
import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import SendSplitMixin from '../../common/controllers/SendSplitMixin';
import ComparatorService from '../../common/services/ComparatorService';
import { TypedInputTypes } from '../../const';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import {
    HassArea,
    HassDevice,
    HassEntity,
    HassEntityRegistryEntry,
    HassFloor,
    HassLabel,
} from '../../types/home-assistant';
import { i18nKeyandParams } from '../../types/i18n';
import { NodeMessage } from '../../types/nodes';
import { GetEntitiesNode, GetEntitiesNodeProperties } from '.';
import { OutputType } from './const';
import { sortConditions } from './helpers';
import { SimpleComparatorType, simpleComparison } from './operators';
import { Rule } from './types';

interface GetEntitiesControllerConstructor
    extends InputOutputControllerOptions<
        GetEntitiesNode,
        GetEntitiesNodeProperties
    > {
    comparatorService: ComparatorService;
    homeAssistant: HomeAssistant;
}

const SendSplitController = SendSplitMixin(
    InputOutputController<GetEntitiesNode, GetEntitiesNodeProperties>,
);
export default class GetEntitiesController extends SendSplitController {
    #comparatorService: ComparatorService;
    #homeAssistant: HomeAssistant;
    // Store the current device and area to avoid multiple lookups
    #currentDevice: HassDevice | undefined;
    #currentArea: HassArea | undefined;
    #currentFloor: HassFloor | undefined;

    constructor(params: GetEntitiesControllerConstructor) {
        super(params);
        this.#comparatorService = params.comparatorService;
        this.#homeAssistant = params.homeAssistant;
    }

    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        let noPayload = false;

        const entities = await this.#getEntities(
            parsedMessage.rules.value,
            message,
        );

        let statusText: i18nKeyandParams = [
            'ha-get-entities.status.number_of_results',
            { count: entities.length },
        ];
        let payload: number | HassEntity | HassEntity[] = [];

        switch (parsedMessage.outputType.value) {
            case OutputType.Count:
                payload = entities.length;
                break;
            case OutputType.Split:
                if (entities.length === 0) {
                    noPayload = true;
                    break;
                }

                this.status.setSuccess(statusText);
                this.sendSplit(message, entities, send);
                done();
                return;
            case OutputType.Random: {
                if (entities.length === 0) {
                    noPayload = true;
                    break;
                }
                const maxReturned =
                    Number(parsedMessage.outputResultsCount.value) || 1;
                const max =
                    entities.length <= maxReturned
                        ? entities.length
                        : maxReturned;
                const shuffledEntities = shuffle(entities);
                payload = shuffledEntities.slice(0, max);
                if (maxReturned === 1) {
                    payload = payload[0];
                    statusText = [
                        'ha-get-entities.status.number_of_random_resuls',
                        { count: 1 },
                    ];
                } else {
                    statusText = [
                        'ha-get-entities.status.number_of_random_resuls',
                        { count: Array.isArray(payload) ? payload.length : 0 },
                    ];
                }

                break;
            }
            case OutputType.Array:
            default:
                if (
                    entities.length === 0 &&
                    !parsedMessage.outputEmptyResults.value
                ) {
                    noPayload = true;
                }

                payload = entities;
                break;
        }

        if (noPayload) {
            this.status.setFailed('ha-get-entities.status.no_results');
            done();
            return;
        }

        this.status.setSuccess(statusText);

        this.contextService.set(
            payload,
            parsedMessage.outputLocationType.value,
            parsedMessage.outputLocation.value,
            message,
        );

        send(message);
        done();
    }

    async #getEntities(
        conditions: Rule[],
        message: NodeMessage,
    ): Promise<HassEntity[]> {
        const filteredEntities: HassEntity[] = [];
        const states = this.#homeAssistant.websocket.getStates();
        const sortedConditions = sortConditions(conditions);
        const entityRegistryMap = new Map(
            this.#homeAssistant.websocket
                .getEntities()
                .map((e) => [e.entity_id, e]),
        );

        for (const entityState of Object.values(states) as HassEntity[]) {
            this.#resetCurrent();

            // TODO: Remove for version 1.0
            if (entityState?.last_changed) {
                entityState.timeSinceChangedMs =
                    Date.now() - new Date(entityState.last_changed).getTime();
            }

            const entity = entityRegistryMap.get(entityState.entity_id);

            const conditionChecks = sortedConditions.map(async (rule) => {
                if (
                    rule.condition === PropertySelectorType.State ||
                    // If the condition is not set, it is a state condition
                    rule.condition === undefined
                ) {
                    const value = selectn(rule.property, entityState);
                    const result =
                        await this.#comparatorService.getComparatorResult(
                            rule.logic,
                            rule.value,
                            value,
                            rule.valueType,
                            {
                                message,
                                entity: entityState,
                            },
                        );

                    if (
                        (rule.logic !== TypedInputTypes.JSONata &&
                            value === undefined) ||
                        !result
                    ) {
                        return false;
                    }
                } else if (rule.condition === PropertySelectorType.Label) {
                    if (!entity || !entity.labels.length) return false;

                    const labelCheck = entity.labels.some(async (labelId) => {
                        const label =
                            this.#homeAssistant.websocket.getLabel(labelId);
                        if (!label) {
                            return false;
                        }

                        return simpleComparison(
                            rule.logic as SimpleComparatorType,
                            label[rule.property as keyof HassLabel] as string,
                            await this.typedInputService.getValue(
                                rule.value,
                                rule.valueType as TypedInputTypes,
                                { message, entity: entityState },
                            ),
                        );
                    });

                    if (!labelCheck) {
                        return false;
                    }
                } else {
                    const propertyValue = this.#getPropertyValue(
                        rule.condition,
                        rule.property,
                        entity,
                    );
                    if (!propertyValue) return false;

                    const result = simpleComparison(
                        rule.logic as SimpleComparatorType,
                        propertyValue,
                        await this.typedInputService.getValue(
                            rule.value,
                            rule.valueType as TypedInputTypes,
                            {
                                message,
                                entity: entityState,
                            },
                        ),
                    );

                    if (!result) {
                        return false;
                    }
                }

                return true;
            });

            const ruleMatched = (await Promise.all(conditionChecks)).every(
                Boolean,
            );

            if (ruleMatched && entityState) {
                filteredEntities.push(entityState);
            }
        }

        return filteredEntities;
    }

    #getPropertyValue(
        condition: PropertySelectorType,
        property: string,
        entity: HassEntityRegistryEntry | undefined,
    ) {
        if (!entity) return undefined;

        switch (condition) {
            case PropertySelectorType.Device:
                return this.#getDevice(entity)?.[property as keyof HassDevice];
            case PropertySelectorType.Area:
                return this.#getArea(entity)?.[property as keyof HassArea];
            case PropertySelectorType.Floor:
                return this.#getFloor(entity)?.[property as keyof HassFloor];
            default:
                return undefined;
        }
    }

    #getDevice(entity: HassEntityRegistryEntry): HassDevice | undefined {
        if (!this.#currentDevice && entity.device_id) {
            this.#currentDevice = this.#homeAssistant.websocket.getDevice(
                entity.device_id,
            );
        }

        return this.#currentDevice;
    }

    #getArea(entity: HassEntityRegistryEntry): HassArea | undefined {
        if (this.#currentArea) {
            return this.#currentArea;
        }

        if (entity.area_id) {
            this.#currentArea = this.#homeAssistant.websocket.getArea(
                entity.area_id,
            );
        }

        if (!this.#currentArea && entity.device_id) {
            const device = this.#getDevice(entity);
            if (device?.area_id) {
                this.#currentArea = this.#homeAssistant.websocket.getArea(
                    device.area_id,
                );
            }
        }

        return this.#currentArea;
    }

    #getFloor(entity: HassEntityRegistryEntry): HassFloor | undefined {
        if (this.#currentFloor) {
            return this.#currentFloor;
        }

        const area = this.#getArea(entity);

        if (area?.floor_id) {
            this.#currentFloor = this.#homeAssistant.websocket.getFloor(
                area.floor_id,
            );
        }

        return this.#currentFloor;
    }

    #resetCurrent() {
        this.#currentDevice = undefined;
        this.#currentArea = undefined;
        this.#currentFloor = undefined;
    }
}
