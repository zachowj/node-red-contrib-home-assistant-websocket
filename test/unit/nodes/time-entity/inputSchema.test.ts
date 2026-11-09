import { inputSchema } from '../../../../src/nodes/time-entity';
import { testSchema, testTypedInputTypes } from '../../../helpers/inputSchema';

testSchema(
    'time entity',
    inputSchema,
    [
        ['string value', { value: '12:30:00', valueType: 'str' }],
        ['message value', { value: 'payload', valueType: 'msg' }],
    ],
    [
        ['missing value', { valueType: 'str' }],
        ['empty value', { value: '', valueType: 'str' }],
        ['numeric value', { value: 123, valueType: 'str' }],
        ['missing type', { value: '12:30' }],
        ['invalid type', { value: '12:30', valueType: 'num' }],
        ['unknown field', { value: '12:30', valueType: 'str', extra: true }],
    ],
);

testTypedInputTypes('time entity', inputSchema, { value: 'x' }, 'valueType', [
    'msg',
    'flow',
    'global',
    'jsonata',
    'str',
]);
