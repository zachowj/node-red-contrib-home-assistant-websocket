import { NodeMessage } from 'node-red';
import selectn from 'selectn';
import { HassEntity } from 'types/home-assistant';

import HomeAssistant from '../../homeAssistant/HomeAssistant';
import TransformState, { DataType } from '../TransformState';
import JSONataService from './JSONataService';
import NodeRedContextService, {
    isContextLocation,
} from './NodeRedContextService';

export default class ComparatorService {
    private readonly nodeRedContextService: NodeRedContextService;
    private readonly homeAssistant: HomeAssistant;
    private readonly jsonataService: JSONataService;
    private readonly transformState: TransformState;

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
        this.nodeRedContextService = nodeRedContextService;
        this.homeAssistant = homeAssistant;
        this.jsonataService = jsonataService;
        this.transformState = transformState;
    }

    getComparatorResult(
        comparatorType: string, // is, is not, less, greater, less or equal, greater or equal
        comparatorValue: string, // user entered value
        actualValue: string, // value to compare against, state
        comparatorValueDatatype: string, // datatype of the comparator value, str, num, bool
        {
            message,
            entity,
            prevEntity,
        }: {
            message?: NodeMessage;
            entity?: HassEntity;
            prevEntity?: HassEntity;
        } = {}
    ) {
        let cValue;
        if (isContextLocation(comparatorValueDatatype)) {
            cValue = this.nodeRedContextService.get(
                comparatorValueDatatype,
                comparatorValue,
                message
            );
        } else if (['entity', 'prevEntity'].includes(comparatorValueDatatype)) {
            cValue = selectn(
                comparatorValue,
                comparatorValueDatatype === 'entity' ? entity : prevEntity
            );
        } else if (
            comparatorType !== 'jsonata' &&
            comparatorValueDatatype === 'jsonata' &&
            comparatorValue
        ) {
            cValue = this.jsonataService.evaluate(comparatorValue, {
                message,
                entity,
                prevEntity,
            });
        } else {
            if (
                comparatorType === 'includes' ||
                comparatorType === 'does_not_include'
            ) {
                comparatorValueDatatype = 'list';
            }

            cValue = this.transformState.transform(
                comparatorValueDatatype as DataType,
                comparatorValue
            );
        }

        // TODO: Use migration service to convert old comparators to new comparators
        switch (comparatorType) {
            case 'is':
            case 'is_not': {
                // Datatype might be num, bool, str, re (regular expression)
                const isMatch =
                    comparatorValueDatatype === 're'
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
                const ent = this.homeAssistant?.websocket.getStates(cValue);
                const groupEntities =
                    selectn('attributes.entity_id', ent) || [];
                return groupEntities.includes(actualValue);
            }
            case 'jsonata':
                if (!cValue) return true;

                return (
                    this.jsonataService.evaluate(cValue, {
                        message,
                        entity,
                        prevEntity,
                    }) === true
                );
        }
    }
}
