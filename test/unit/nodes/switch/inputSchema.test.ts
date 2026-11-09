import { inputSchema } from '../../../../src/nodes/switch';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'switch',
    inputSchema,
    [
        ['empty object', {}],
        ['arbitrary properties', { value: true, extra: { nested: 1 } }],
    ],
    [
        ['non-object', 'on'],
        ['null', null],
    ],
);
