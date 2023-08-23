import { isPlainObject } from 'lodash';

export function isString(value: any): value is string {
    return typeof value === 'string';
}

export function isRecord(value: any): value is Record<string, unknown> {
    return isPlainObject(value);
}
