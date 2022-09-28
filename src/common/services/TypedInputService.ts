import { cloneDeep } from 'lodash';
import selectn from 'selectn';

import { TypedInputTypes } from '../../const';
import JSONata from './JSONataService';
import NodeRedContext from './NodeRedContextService';

export default class TypedInputService {
    readonly #nodeConfig: Record<string, any>;
    readonly #context: NodeRedContext;
    readonly #jsonata: JSONata;

    constructor({
        nodeConfig,
        context,
        jsonata,
    }: {
        nodeConfig: Record<string, any>;
        context: NodeRedContext;
        jsonata: JSONata;
    }) {
        this.#nodeConfig = nodeConfig;
        this.#context = context;
        this.#jsonata = jsonata;
    }

    getValue(
        value: string,
        valueType: TypedInputTypes,
        props: Record<string, any> = {}
    ) {
        let val;
        switch (valueType) {
            case TypedInputTypes.Message:
            case TypedInputTypes.Flow:
            case TypedInputTypes.Global:
                val = this.#context.get(valueType, value, props.message);
                break;
            case TypedInputTypes.Boolean:
                val = value === 'true';
                break;
            case TypedInputTypes.JSON:
                try {
                    val = JSON.parse(value);
                } catch (e) {
                    // error parsing
                }
                break;
            case TypedInputTypes.Date:
                val = Date.now();
                break;
            case TypedInputTypes.JSONata:
                // no reason to error just return undefined
                if (value === '') {
                    val = undefined;
                    break;
                }
                val = this.#jsonata.evaluate(value, {
                    data: props.data,
                    entity: props.entity,
                    entityId: props.entityId,
                    eventData: props.eventData,
                    message: props.message,
                    prevEntity: props.prevEntity,
                    results: props.results,
                });
                break;
            case TypedInputTypes.Number:
                val = Number(value);
                break;
            case TypedInputTypes.None:
                val = undefined;
                break;
            case TypedInputTypes.Config: {
                val = cloneDeep(
                    value.length
                        ? selectn(value, this.#nodeConfig)
                        : this.#nodeConfig
                );
                break;
            }
            case TypedInputTypes.Data:
            case TypedInputTypes.Entity:
            case TypedInputTypes.EntityState:
            case TypedInputTypes.EventData:
            case TypedInputTypes.Headers:
            case TypedInputTypes.Params:
            case TypedInputTypes.TriggerId:
            case TypedInputTypes.PrevEntity:
            case TypedInputTypes.Results:
                val = props[valueType];
                break;
            default:
                val = value;
        }
        return val;
    }
}
