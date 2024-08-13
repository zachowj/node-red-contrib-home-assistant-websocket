import { ComparatorType } from '../../const';
import { isBoolean, isString } from '../../helpers/assert';

type Comparator = (a: unknown, b?: unknown, c?: unknown) => boolean;
export type SimpleComparatorType =
    | ComparatorType.Is
    | ComparatorType.IsNot
    | ComparatorType.Contains
    | ComparatorType.DoesNotContain
    | ComparatorType.Includes
    | ComparatorType.DoesNotInclude
    | ComparatorType.StartsWith
    | ComparatorType.IsNull
    | ComparatorType.IsNotNull
    | ComparatorType.IsTrue
    | ComparatorType.IsFalse
    | ComparatorType.Regex;

function isEqual(a: unknown, b: unknown): boolean {
    // eslint-disable-next-line eqeqeq
    return a == b;
}

function isNotEqual(a: unknown, b: unknown): boolean {
    // eslint-disable-next-line eqeqeq
    return a != b;
}

function contains(a: unknown, b: unknown): boolean {
    if (!Array.isArray(a) || !isString(b)) {
        return false;
    }
    return a.includes(b);
}

function doesNotContain(a: unknown, b: unknown): boolean {
    return !operators[ComparatorType.Contains](a, b);
}

function includes(a: unknown, b: unknown): boolean {
    if (!isString(a) || !isString(b)) {
        return false;
    }
    const list = b.split(',').map((item) => item.trim());
    return list.includes(a);
}

function doesNotInclude(a: unknown, b: unknown): boolean {
    return !operators[ComparatorType.Includes](a, b);
}

function startsWith(a: unknown, b: unknown): boolean {
    if (!isString(a) || !isString(b)) {
        return false;
    }
    return a.startsWith(b);
}

function isNull(a: unknown): boolean {
    return a === null;
}

function isNotNull(a: unknown): boolean {
    return a !== null;
}

function isTrue(a: unknown): boolean {
    return a === true;
}

function isFalse(a: unknown): boolean {
    return a === false;
}

function regex(a: unknown, b: unknown, c: unknown): boolean {
    if (!isString(a) || !isString(b) || !isBoolean(c)) {
        return false;
    }
    return new RegExp(b, c ? 'i' : '').test(a);
}

const operators: Record<SimpleComparatorType, Comparator> = {
    [ComparatorType.Is]: isEqual,
    [ComparatorType.IsNot]: isNotEqual,
    [ComparatorType.Contains]: contains,
    [ComparatorType.DoesNotContain]: doesNotContain,
    [ComparatorType.Includes]: includes,
    [ComparatorType.DoesNotInclude]: doesNotInclude,
    [ComparatorType.StartsWith]: startsWith,
    [ComparatorType.IsNull]: isNull,
    [ComparatorType.IsNotNull]: isNotNull,
    [ComparatorType.IsTrue]: isTrue,
    [ComparatorType.IsFalse]: isFalse,
    [ComparatorType.Regex]: regex,
} as const;

export function simpleComparison(
    operator: SimpleComparatorType,
    a: unknown,
    b?: unknown,
    c?: unknown,
): boolean {
    return operators[operator](a, b, c);
}
