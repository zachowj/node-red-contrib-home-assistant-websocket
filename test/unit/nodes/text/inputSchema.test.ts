import { inputSchema } from '../../../../src/nodes/text';
import { testSchema, testTypedInputTypes } from '../../../helpers/inputSchema';

testSchema(
    'text',
    inputSchema,
    [
        ['string value', { value: 'hello', valueType: 'str' }],
        ['number value', { value: 0, valueType: 'msg' }],
    ],
    [
        ['missing value', { valueType: 'str' }],
        ['empty value', { value: '', valueType: 'str' }],
        ['null value', { value: null, valueType: 'str' }],
        ['boolean value', { value: true, valueType: 'str' }],
        ['missing type', { value: 1 }],
        ['invalid type', { value: 1, valueType: 'bool' }],
        ['unknown field', { value: 1, valueType: 'str', extra: true }],
    ],
);

testTypedInputTypes('text', inputSchema, { value: 'x' }, 'valueType', [
    'msg',
    'flow',
    'global',
    'jsonata',
    'str',
]);
