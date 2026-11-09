import { inputSchema } from '../../../../src/nodes/fire-event';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'fire event',
    inputSchema,
    [
        ['missing optional fields', {}],
        ['empty data', { event: 'event', data: '', dataType: 'json' }],
        ['object data', { data: { value: 1 }, dataType: 'jsonata' }],
    ],
    [
        ['empty event', { event: '' }],
        ['array data', { data: [] }],
        ['invalid data type', { dataType: 'msg' }],
        ['unknown field', { extra: true }],
    ],
);
