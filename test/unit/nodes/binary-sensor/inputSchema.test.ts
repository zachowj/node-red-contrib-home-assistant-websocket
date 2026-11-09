import { describe, expect, it } from 'vitest';

import { TypedInputTypes } from '../../../../src/const';
import { inputSchema } from '../../../../src/nodes/binary-sensor';
import { testSchema, testTypedInputTypes } from '../../../helpers/inputSchema';

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

const binaryBase = {
    stateType: 'msg',
    available: true,
    availableType: 'bool',
};

testSchema(
    'binary sensor',
    inputSchema,
    [
        ['availability without state', binaryBase],
        [
            'numeric state and availability',
            { ...binaryBase, state: 0, available: 1 },
        ],
        [
            'configured attributes',
            {
                ...binaryBase,
                attributes: [
                    { property: 'unit', value: null, valueType: 'str' },
                ],
            },
        ],
        [
            'message attributes',
            {
                ...binaryBase,
                attributes: {
                    text: 'x',
                    count: 1,
                    enabled: true,
                    object: {},
                    list: [],
                },
            },
        ],
    ],
    [
        ['missing state type', { available: true, availableType: 'bool' }],
        ['invalid state type', { ...binaryBase, stateType: 'date' }],
        ['invalid state', { ...binaryBase, state: {} }],
        ['missing availability', { stateType: 'msg', availableType: 'bool' }],
        ['invalid availability', { ...binaryBase, available: null }],
        ['invalid availability type', { ...binaryBase, availableType: 'num' }],
        [
            'missing attribute property',
            { ...binaryBase, attributes: [{ value: 1, valueType: 'num' }] },
        ],
        [
            'missing attribute value',
            {
                ...binaryBase,
                attributes: [{ property: 'x', valueType: 'num' }],
            },
        ],
        [
            'invalid attribute type',
            {
                ...binaryBase,
                attributes: [{ property: 'x', value: 1, valueType: 'none' }],
            },
        ],
        ['null message attribute', { ...binaryBase, attributes: { x: null } }],
        ['unknown field', { ...binaryBase, extra: true }],
    ],
);

testTypedInputTypes('binary state', inputSchema, binaryBase, 'stateType', [
    'msg',
    'flow',
    'global',
    'jsonata',
    'str',
    'num',
    'bool',
]);
testTypedInputTypes(
    'binary availability',
    inputSchema,
    binaryBase,
    'availableType',
    ['msg', 'flow', 'global', 'jsonata', 'bool'],
);
