import { ComparatorType } from '../../const';
import { isBoolean, isString } from '../../helpers/assert';

export function simpleComparison(
    operator: ComparatorType,
    a: unknown,
    b?: unknown,
    c?: unknown,
): boolean {
    switch (operator) {
        /**
         * Compares two values for equality using loose comparison (`==`).
         *
         * @param a - The first value to compare.
         * @param b - The second value to compare.
         * @returns `true` if the values are loosely equal, otherwise `false`.
         */
        case ComparatorType.Is:
            return a === b;

        /**
         * Determines whether two values are not equal using loose inequality (`!=`).
         *
         * @param a - The first value to compare.
         * @param b - The second value to compare.
         * @returns `true` if the values are not equal (using loose comparison), otherwise `false`.
         */
        case ComparatorType.IsNot:
            return a !== b;

        /**
         * Determines whether the array `a` contains the element `b`.
         *
         * @param a - The array to search within. If not an array, the function returns `false`.
         * @param b - The element to search for in the array `a`.
         * @returns `true` if `a` is an array and contains `b`, otherwise `false`.
         */
        case ComparatorType.Contains:
            return Array.isArray(a) && a.includes(b);

        /**
         * Determines whether the first value does not contain the second value.
         * Internally, this negates the result of the 'Contains' comparator.
         *
         * @param a - The value to be checked for containment.
         * @param b - The value to check for within 'a'.
         * @returns True if 'a' does not contain 'b'; otherwise, false.
         */
        case ComparatorType.DoesNotContain:
            return Array.isArray(a) && !a.includes(b);

        /**
         * Determines if the string `a` is included in the comma-separated list represented by string `b`.
         *
         * Both `a` and `b` must be strings; otherwise, the function returns `false`.
         * The function splits `b` by commas, trims whitespace from each item, and checks if `a` matches any item.
         *
         * @param a - The value to search for in the list.
         * @param b - A comma-separated string representing the list of possible values.
         * @returns `true` if `a` is found in the list derived from `b`, otherwise `false`.
         */
        case ComparatorType.Includes:
            return (
                isString(a) &&
                isString(b) &&
                b
                    .split(',')
                    .map((s) => s.trim())
                    .includes(a)
            );

        /**
         * Determines whether the first value does not include the second value.
         * This is the logical negation of the 'includes' comparator.
         *
         * @param a - The value to be checked for inclusion.
         * @param b - The value to check for within `a`.
         * @returns `true` if `a` does not include `b`, otherwise `false`.
         */
        case ComparatorType.DoesNotInclude:
            return (
                isString(a) &&
                isString(b) &&
                !b
                    .split(',')
                    .map((s) => s.trim())
                    .includes(a)
            );

        /* Checks if a string starts with another string.
         * a is the string to check
         * b is the prefix to check
         */
        case ComparatorType.StartsWith:
            return isString(a) && isString(b) && a.startsWith(b);

        case ComparatorType.IsNull:
            return a === null;

        case ComparatorType.IsNotNull:
            return a !== null;

        case ComparatorType.IsTrue:
            return a === true;

        case ComparatorType.IsFalse:
            return a === false;

        /**
         * Tests whether a given string matches a regular expression pattern.
         *
         * @param a - The string to test against the regular expression.
         * @param b - The regular expression pattern as a string.
         * @param c - If true, the regular expression is case-insensitive.
         * @returns `true` if `a` matches the pattern `b` (with optional case-insensitivity), otherwise `false`.
         */
        case ComparatorType.Regex:
            return (
                isString(a) &&
                isString(b) &&
                isBoolean(c) &&
                new RegExp(b, c ? 'i' : '').test(a)
            );

        default:
            throw new Error(`Unknown comparator type: ${operator}`);
    }
}
