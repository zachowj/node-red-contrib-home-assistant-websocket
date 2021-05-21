// eslint-disable-next-line no-unused-vars
const haUtils = (function () {
    function compareObjects(whole, subset) {
        if (whole === subset) return true;

        if (
            typeof whole !== 'object' ||
            typeof subset !== 'object' ||
            whole == null ||
            subset == null
        )
            return false;

        const keysWhole = Object.keys(whole);
        const keysSubset = Object.keys(subset);

        if (keysWhole.length < keysSubset.length) return false;

        for (const key of keysSubset) {
            if (!keysWhole.includes(key)) return false;

            if (!compareObjects(whole[key], subset[key])) return false;
        }

        return true;
    }

    function compareVersion(required, current) {
        required = required
            .split('.')
            .map((s) => s.padStart(5))
            .join('.');
        current = current
            .split('.')
            .map((s) => s.padStart(5))
            .join('.');
        return required <= current;
    }

    function deepFind(p, o) {
        return p.split('.').reduce((a, v) => a[v], o);
    }

    return {
        compareObjects,
        compareVersion,
        deepFind,
    };
})();
