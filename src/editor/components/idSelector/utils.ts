// Push an element to an array if it does not exist
export function pushIfNotExist<T>(array: T[], element: T) {
    if (!array.includes(element)) {
        array.push(element);
    }
}

function compareBitmask(
    supported: number,
    required: (number | number[])[],
): boolean {
    return required.some((req) => {
        if (Array.isArray(req)) {
            return req.every((r) => (supported & r) !== 0);
        } else {
            return (supported & req) !== 0;
        }
    });
}

export function isFeatureSupported(
    bitmask: number,
    required: (number | number[])[],
): boolean {
    if (required.length === 0) {
        return true;
    }
    return compareBitmask(bitmask, required);
}
