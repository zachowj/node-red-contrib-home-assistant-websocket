/* https://stackoverflow.com/questions/68278850/how-to-extend-a-keyof-type-so-that-it-includes-modified-versions-of-the-keys-e/68279093#68279093 */
type sortArg<T> = keyof T | `-${string & keyof T}`;

/**
 * Returns a comparator for objects of type T that can be used by sort
 * functions, were T objects are compared by the specified T properties.
 *
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function byPropertiesOf<T extends object>(sortBy: Array<sortArg<T>>) {
    function compareByProperty(arg: sortArg<T>) {
        let key: keyof T;
        let sortOrder = 1;
        if (typeof arg === 'string' && arg.startsWith('-')) {
            sortOrder = -1;
            // Typescript is not yet smart enough to infer that substring is keyof T
            key = arg.substring(1) as keyof T;
        } else {
            // Likewise it is not yet smart enough to infer that arg is not keyof T
            key = arg as keyof T;
        }
        return function (a: T, b: T) {
            const aValue = a[key];
            const bValue = b[key];
            const strings =
                typeof aValue === 'string' && typeof bValue === 'string';
            const result = strings
                ? aValue.localeCompare(bValue)
                : a[key] < b[key]
                ? -1
                : a[key] > b[key]
                ? 1
                : 0;

            return result * sortOrder;
        };
    }

    return function (obj1: T, obj2: T) {
        let i = 0;
        let result = 0;
        const numberOfProperties = sortBy?.length;
        while (result === 0 && i < numberOfProperties) {
            result = compareByProperty(sortBy[i])(obj1, obj2);
            i++;
        }

        return result;
    };
}

/**
 * Sorts an array of T by the specified properties of T.
 *
 * @param arr - the array to be sorted, all of the same type T
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function sort<T extends object>(arr: T[], ...sortBy: Array<sortArg<T>>) {
    arr.sort(byPropertiesOf<T>(sortBy));
}
