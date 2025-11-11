import { NodeMessage } from 'node-red';
import selectn from 'selectn';

import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { HassEntity } from '../../types/home-assistant';
import TransformState, { TransformType } from '../TransformState';
import JSONataService from './JSONataService';
import NodeRedContextService, {
    isContextLocation,
} from './NodeRedContextService';

export default class ComparatorService {
    readonly #nodeRedContextService: NodeRedContextService;
    readonly #homeAssistant: HomeAssistant;
    readonly #jsonataService: JSONataService;
    readonly #transformState: TransformState;

    constructor({
        nodeRedContextService,
        homeAssistant,
        jsonataService,
        transformState,
    }: {
        nodeRedContextService: NodeRedContextService;
        homeAssistant: HomeAssistant;
        jsonataService: JSONataService;
        transformState: TransformState;
    }) {
        this.#nodeRedContextService = nodeRedContextService;
        this.#homeAssistant = homeAssistant;
        this.#jsonataService = jsonataService;
        this.#transformState = transformState;
    }

    async getComparatorResult(
        comparatorType: string, // is, is not, less, greater, less or equal, greater or equal
        comparatorValue: string, // user entered value
        actualValue: any, // value to compare against, state
        comparatorValueDataType: string, // datatype of the comparator value, str, num, bool
        {
            message,
            entity,
            prevEntity,
        }: {
            message?: NodeMessage;
            entity?: HassEntity | null;
            prevEntity?: HassEntity | null;
        } = {},
    ): Promise<boolean> {
        let cValue;
        if (isContextLocation(comparatorValueDataType)) {
            cValue = this.#nodeRedContextService.get(
                comparatorValueDataType,
                comparatorValue,
                message,
            );
        } else if (['entity', 'prevEntity'].includes(comparatorValueDataType)) {
            cValue = selectn(
                comparatorValue,
                comparatorValueDataType === 'entity' ? entity : prevEntity,
            );
        } else if (
            comparatorType !== 'jsonata' &&
            comparatorValueDataType === 'jsonata' &&
            comparatorValue
        ) {
            cValue = await this.#jsonataService.evaluate(comparatorValue, {
                message,
                entity,
                prevEntity,
            });
        } else if (comparatorValueDataType === 'habool') {
            cValue = this.#transformState.transform(
                TransformType.Home_Assistant_Boolean_Values,
                '',
            );
        } else if (comparatorValueDataType === 'bool') {
            cValue = comparatorValue === 'true';
        } else {
            if (
                comparatorType === 'includes' ||
                comparatorType === 'does_not_include'
            ) {
                comparatorValueDataType = 'list';
            }

            cValue = this.#transformState.transform(
                comparatorValueDataType as TransformType,
                comparatorValue,
            );
        }

        // TODO: Use migration service to convert old comparators to new comparators
        switch (comparatorType) {
            case 'is':
            case 'is_not': {
                // Datatype might be num, bool, str, re (regular expression)
                const isMatch =
                    comparatorValueDataType === 're'
                        ? cValue.test(actualValue)
                        : cValue === actualValue;
                return comparatorType === 'is' ? isMatch : !isMatch;
            }
            case 'includes':
            case 'does_not_include': {
                const isIncluded = cValue.includes(actualValue);
                return comparatorType === 'includes' ? isIncluded : !isIncluded;
            }
            case 'cont':
                if (cValue === '') return false;
                return (actualValue + '').indexOf(cValue) !== -1;
            case 'greater_than': // here for backwards compatibility
            case '>':
            case 'gt':
                return actualValue > cValue;
            case '>=':
            case 'gte':
                return actualValue >= cValue;
            case 'less_than': // here for backwards compatibility
            case '<':
            case 'lt':
                return actualValue < cValue;
            case '<=':
            case 'lte':
                return actualValue <= cValue;
            case 'starts_with':
                if (cValue === '') return false;
                return actualValue?.startsWith(cValue);
            case 'in_group': {
                const ent = this.#homeAssistant?.websocket.getState(cValue);
                const groupEntities =
                    selectn('attributes.entity_id', ent) || [];
                return groupEntities.includes(actualValue);
            }
            case 'jsonata': {
                if (!cValue) return true;

                const jsonataResult = await this.#jsonataService.evaluate(
                    cValue,
                    {
                        message,
                        entity,
                        prevEntity,
                    },
                );

                return jsonataResult === true;
            }
            default:
                return Boolean(actualValue);
        }
    }
}
