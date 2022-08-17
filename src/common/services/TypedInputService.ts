import { cloneDeep } from 'lodash';
import selectn from 'selectn';

import JSONata from './JSONataService';
import NodeRedContext from './NodeRedContextService';

export type CustomOutputTypes =
    | 'data'
    | 'entity'
    | 'entityState'
    | 'eventData'
    | 'headers'
    | 'params'
    | 'triggerId'
    | 'prevEntity'
    | 'results';

export type TypedInputTypes =
    | 'msg'
    | 'flow'
    | 'global'
    | 'bool'
    | 'json'
    | 'date'
    | 'jsonata'
    | 'num'
    | 'str'
    | 'none'
    | 'config'
    | CustomOutputTypes;

export default class TypedInputService {
    private readonly nodeConfig: Record<string, any>;
    private readonly context: NodeRedContext;
    private readonly jsonata: JSONata;

    constructor({
        nodeConfig,
        context,
        jsonata,
    }: {
        nodeConfig: Record<string, any>;
        context: NodeRedContext;
        jsonata: JSONata;
    }) {
        this.nodeConfig = nodeConfig;
        this.context = context;
        this.jsonata = jsonata;
    }

    getValue(
        value: string,
        valueType: TypedInputTypes,
        props: Record<string, any> = {}
    ) {
        let val;
        switch (valueType) {
            case 'msg':
            case 'flow':
            case 'global':
                val = this.context.get(valueType, value, props.message);
                break;
            case 'bool':
                val = value === 'true';
                break;
            case 'json':
                try {
                    val = JSON.parse(value);
                } catch (e) {
                    // error parsing
                }
                break;
            case 'date':
                val = Date.now();
                break;
            case 'jsonata':
                // no reason to error just return undefined
                if (value === '') {
                    val = undefined;
                    break;
                }
                try {
                    val = this.jsonata.evaluate(value, {
                        data: props.data,
                        entity: props.entity,
                        entityId: props.entityId,
                        eventData: props.eventData,
                        message: props.message,
                        prevEntity: props.prevEntity,
                        results: props.results,
                    });
                } catch (e) {
                    throw new Error(`JSONata Error: ${e}`);
                }
                break;
            case 'num':
                val = Number(value);
                break;
            case 'none':
                val = undefined;
                break;
            case 'config': {
                val = cloneDeep(
                    value.length
                        ? selectn(value, this.nodeConfig)
                        : this.nodeConfig
                );
                break;
            }
            case 'data':
            case 'entity':
            case 'entityState':
            case 'eventData':
            case 'headers':
            case 'params':
            case 'triggerId':
            case 'prevEntity':
            case 'results':
                val = props[valueType];
                break;
            default:
                val = value;
        }
        return val;
    }
}
