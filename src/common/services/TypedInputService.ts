import selectn from 'selectn';

import { EntityStateCastType, TypedInputTypes } from '../../const';
import { getServerConfigNode } from '../../helpers/node';
import { parseValueToBoolean } from '../../helpers/utils';
import { DeepReadonly, HassEntity } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import JSONata from './JSONataService';
import NodeRedContext from './NodeRedContextService';

type TypedInputEntity = DeepReadonly<
    Omit<Partial<HassEntity>, 'state'> & { state?: unknown }
>;

/** Data a controller can hand to typed inputs; every key is read by `getValue`. */
export interface TypedInputProps {
    calendarItem?: unknown;
    context?: unknown;
    data?: unknown;
    deviceId?: string | null;
    entity?: TypedInputEntity | null;
    entityId?: string;
    eventData?: unknown;
    headers?: Record<string, unknown>;
    message?: NodeMessage;
    params?: Record<string, unknown>;
    prevEntity?: TypedInputEntity | null;
    previousValue?: unknown;
    results?: unknown;
    triggerId?: string;
    value?: unknown;
}

export type OutputData = Omit<TypedInputProps, 'message'>;

/** Declares the keys a controller always passes (a value may still be undefined). */
export type Provides<K extends keyof OutputData> = {
    [P in K]: OutputData[P];
};

// Types whose value is read straight from a props key (others compute or read config).
type PropBackedTypes = {
    [TypedInputTypes.CalendarItem]: 'calendarItem';
    [TypedInputTypes.Data]: 'data';
    [TypedInputTypes.DeviceId]: 'deviceId';
    [TypedInputTypes.Entity]: 'entity';
    [TypedInputTypes.EntityState]: 'entity';
    [TypedInputTypes.EventData]: 'eventData';
    [TypedInputTypes.Headers]: 'headers';
    [TypedInputTypes.Params]: 'params';
    [TypedInputTypes.PrevEntity]: 'prevEntity';
    [TypedInputTypes.PreviousValue]: 'previousValue';
    [TypedInputTypes.Results]: 'results';
    [TypedInputTypes.TimeSinceChangedMs]: 'entity';
    [TypedInputTypes.TriggerId]: 'triggerId';
    [TypedInputTypes.Value]: 'value';
};

const PROP_BACKED_TYPES: PropBackedTypes = {
    [TypedInputTypes.CalendarItem]: 'calendarItem',
    [TypedInputTypes.Data]: 'data',
    [TypedInputTypes.DeviceId]: 'deviceId',
    [TypedInputTypes.Entity]: 'entity',
    [TypedInputTypes.EntityState]: 'entity',
    [TypedInputTypes.EventData]: 'eventData',
    [TypedInputTypes.Headers]: 'headers',
    [TypedInputTypes.Params]: 'params',
    [TypedInputTypes.PrevEntity]: 'prevEntity',
    [TypedInputTypes.PreviousValue]: 'previousValue',
    [TypedInputTypes.Results]: 'results',
    [TypedInputTypes.TimeSinceChangedMs]: 'entity',
    [TypedInputTypes.TriggerId]: 'triggerId',
    [TypedInputTypes.Value]: 'value',
};

/** The props key a value type needs, or undefined if it needs none. */
export function getRequiredProp(
    valueType: TypedInputTypes,
): keyof TypedInputProps | undefined {
    return PROP_BACKED_TYPES[valueType as keyof PropBackedTypes];
}

export default class TypedInputService {
    readonly #nodeConfig: object;
    readonly #context: NodeRedContext;
    readonly #jsonata: JSONata;

    constructor({
        nodeConfig,
        context,
        jsonata,
    }: {
        nodeConfig: object;
        context: NodeRedContext;
        jsonata: JSONata;
    }) {
        this.#nodeConfig = nodeConfig;
        this.#context = context;
        this.#jsonata = jsonata;
    }

    async getValue(
        value: string,
        valueType: TypedInputTypes,
        props: TypedInputProps = {},
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
                val = await this.#jsonata.evaluate(value, { ...props });
                break;
            case TypedInputTypes.Number:
                val = Number(value);
                break;
            case TypedInputTypes.None:
                val = undefined;
                break;
            case TypedInputTypes.Config: {
                val = structuredClone(
                    value.length
                        ? selectn(value, this.#nodeConfig)
                        : this.#nodeConfig,
                );
                break;
            }
            case TypedInputTypes.EntityState:
                switch (value) {
                    case EntityStateCastType.Number:
                        val = Number(props.entity?.state);
                        break;
                    case EntityStateCastType.Boolean:
                        val = parseValueToBoolean(props.entity?.state);
                        break;
                    case EntityStateCastType.HA_Boolean:
                        {
                            const serverConfigId = selectn(
                                'server',
                                this.#nodeConfig,
                            );
                            const serverConfig = getServerConfigNode(
                                typeof serverConfigId === 'string'
                                    ? serverConfigId
                                    : undefined,
                            );
                            const haBooleans = serverConfig?.config.ha_boolean;
                            if (!haBooleans) {
                                val = false;
                                break;
                            }
                            val = haBooleans.includes(
                                props.entity?.state as string,
                            );
                        }
                        break;
                    case EntityStateCastType.String:
                    default: // entity state didn't have a value until version 0.79.0
                        val = props.entity?.state;
                        break;
                }
                break;
            case TypedInputTypes.TimeSinceChangedMs: {
                const lastChanged = props.entity?.last_changed;
                const timestamp = lastChanged
                    ? new Date(lastChanged).getTime()
                    : Number.NaN;
                val = Number.isFinite(timestamp)
                    ? Date.now() - timestamp
                    : undefined;
                break;
            }
            default: {
                const requiredProp = getRequiredProp(valueType);
                val = requiredProp ? props[requiredProp] : value;
            }
        }
        return val;
    }
}
