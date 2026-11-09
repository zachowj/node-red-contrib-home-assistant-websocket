import { expect, it } from 'vitest';

import InputService from '../../../../src/common/services/InputService';
import { ComparatorType } from '../../../../src/const';
import { inputSchema } from '../../../../src/nodes/get-entities';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'get entities',
    inputSchema,
    [
        ['missing optional fields', {}],
        [
            'output settings and ordinary rule',
            {
                outputType: 'array',
                outputEmptyResults: 'true',
                outputLocationType: 'flow',
                outputLocation: 'entities',
                outputResultsCount: '2',
                rules: [
                    {
                        condition: 'state_object',
                        property: 'state',
                        logic: 'is',
                        value: '',
                        valueType: 'str',
                    },
                ],
            },
        ],
        [
            'JSONata rule permits non-string property',
            {
                rules: [
                    {
                        logic: 'jsonata',
                        property: { expression: true },
                        valueType: '',
                    },
                ],
            },
        ],
        [
            'empty optional rule strings',
            { rules: [{ condition: '', logic: '', value: '', valueType: '' }] },
        ],
    ],
    [
        ['invalid output type', { outputType: 'other' }],
        ['invalid boolean', { outputEmptyResults: 'yes' }],
        ['invalid location type', { outputLocationType: 'none' }],
        ['empty output location', { outputLocation: '' }],
        ['invalid count', { outputResultsCount: 'many' }],
        ['invalid rule condition', { rules: [{ condition: 'other' }] }],
        [
            'non-string property without JSONata',
            { rules: [{ logic: 'is', property: 1 }] },
        ],
        ['invalid comparator', { rules: [{ logic: 'other' }] }],
        ['invalid rule value', { rules: [{ value: 1 }] }],
        ['invalid rule value type', { rules: [{ valueType: 'other' }] }],
        ['unknown rule field', { rules: [{ extra: true }] }],
        ['unknown field', { extra: true }],
    ],
);

it.each(Object.values(ComparatorType))(
    'accepts rule comparator %s',
    function (logic) {
        expect(
            InputService.validateSchema(inputSchema, { rules: [{ logic }] }),
        ).toBe(true);
    },
);
