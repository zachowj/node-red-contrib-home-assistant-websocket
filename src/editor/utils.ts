export function compareObjects(whole: any, subset: any) {
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

export function compareVersion(required: string, current: string) {
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

export function deepFind(p: string, o: any) {
    return p.split('.').reduce((a, v) => a[v], o);
}

export function isjQuery(obj: any) {
    return obj && (obj instanceof jQuery || obj.constructor.prototype.jquery);
}

export const disableSelect2OpenOnRemove = (ele: HTMLElement | JQuery) => {
    const $ele = isjQuery(ele) ? (ele as JQuery) : $(ele);
    $ele.on('select2:unselecting', () => {
        $ele.on('select2:opening', (e) => {
            e.preventDefault();
            $ele.off('select2:opening');
        });
    });
};
