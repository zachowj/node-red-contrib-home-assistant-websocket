import { inputSchema } from '../../../../src/nodes/number';
import { testSchema, testTypedInputTypes } from '../../../helpers/inputSchema';

testSchema(
    'number',
    inputSchema,
    [
        ['string value', { value: 'hello', valueType: 'num' }],
        ['number value', { value: 0, valueType: 'msg' }],
    ],
    [
        ['missing value', { valueType: 'num' }],
        ['empty value', { value: '', valueType: 'num' }],
        ['null value', { value: null, valueType: 'num' }],
        ['boolean value', { value: true, valueType: 'num' }],
        ['missing type', { value: 1 }],
        ['invalid type', { value: 1, valueType: 'bool' }],
        ['unknown field', { value: 1, valueType: 'num', extra: true }],
    ],
);

testTypedInputTypes('number', inputSchema, { value: 1 }, 'valueType', [
    'msg',
    'flow',
    'global',
    'jsonata',
    'num',
]);
