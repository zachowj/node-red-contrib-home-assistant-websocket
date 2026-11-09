import { describe, expect, it } from 'vitest';

import InputService from '../../../../src/common/services/InputService';
import { inputSchema } from '../../../../src/nodes/current-state';

describe('current-state inputSchema', function () {
    it.each([{ entityId: 'light.kitchen' }, { entityId: '42' }])(
        'accepts $entityId',
        function (input) {
            expect(InputService.validateSchema(inputSchema, input)).toBe(true);
        },
    );

    it.each([
        {},
        { entityId: '' },
        { entityId: null },
        { entityId: 42 },
        { entityId: ['light.kitchen'] },
        { entityId: 'light.kitchen', extra: true },
    ])('rejects invalid input %#', function (input) {
        expect(() => InputService.validateSchema(inputSchema, input)).toThrow();
    });
});
