import { describe, expect, it } from 'vitest';

import { TypedInputTypes } from '../../../../src/const';
import { inputSchema } from '../../../../src/nodes/binary-sensor';

describe('binary-sensor inputSchema', function () {
    const availableFields = {
        available: 'true',
        availableType: TypedInputTypes.Boolean,
        stateType: TypedInputTypes.Message,
    };

    it('allows availability-only updates without state', function () {
        const { error } = inputSchema.validate(availableFields);

        expect(error).toBeUndefined();
    });

    it('still accepts state with available', function () {
        const { error } = inputSchema.validate({
            ...availableFields,
            state: 'payload.state',
        });

        expect(error).toBeUndefined();
    });

    it('requires available', function () {
        const { error } = inputSchema.validate({
            state: 'payload',
            stateType: TypedInputTypes.Message,
            availableType: TypedInputTypes.Boolean,
        });

        expect(error).toBeDefined();
    });
});
