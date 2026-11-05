import { describe, expect, it } from 'vitest';

import TransformState, {
    TransformType,
} from '../../../src/common/TransformState';

describe('TransformState.transform', function () {
    const transformState = new TransformState();

    it('returns the string unchanged', function () {
        expect(transformState.transform(TransformType.String, '42')).toBe('42');
    });

    it('converts to a number', function () {
        expect(transformState.transform(TransformType.Number, '42')).toBe(42);
    });

    it('converts to a list', function () {
        expect(transformState.transform(TransformType.List, 'a, b')).toEqual([
            'a',
            'b',
        ]);
    });
});
