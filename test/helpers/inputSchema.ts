import { describe, expect, it } from 'vitest';

import InputService from '../../src/common/services/InputService';
import { TypedInputTypes } from '../../src/const';

type Schema = Parameters<typeof InputService.validateSchema>[0];
type Case = [string, unknown];

export function testSchema(
    name: string,
    schema: Schema,
    valid: Case[],
    invalid: Case[],
) {
    describe.each([name])('%s', function () {
        it.each(valid)('accepts %s', function (_description, input) {
            expect(InputService.validateSchema(schema, input)).toBe(true);
        });
        it.each(invalid)('rejects %s', function (_description, input) {
            expect(() => InputService.validateSchema(schema, input)).toThrow();
        });
    });
}

export function testTypedInputTypes(
    name: string,
    schema: Schema,
    base: Record<string, unknown>,
    field: string,
    allowed: readonly string[],
) {
    it.each(
        Object.values(TypedInputTypes).filter((type) => allowed.includes(type)),
    )(`${name} accepts type %s`, function (type) {
        expect(
            InputService.validateSchema(schema, { ...base, [field]: type }),
        ).toBe(true);
    });
    it.each(
        Object.values(TypedInputTypes).filter(
            (type) => !allowed.includes(type),
        ),
    )(`${name} rejects type %s`, function (type) {
        expect(() =>
            InputService.validateSchema(schema, { ...base, [field]: type }),
        ).toThrow();
    });
}
