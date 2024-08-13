import { isPlainObject } from 'lodash';

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return isPlainObject(value);
}
