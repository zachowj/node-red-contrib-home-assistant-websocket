import { inputSchema } from '../../../../src/nodes/update-config';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'update config',
    inputSchema,
    [
        ['id only', { id: 'entity' }],
        [
            'empty optional strings and options',
            {
                id: 'entity',
                name: '',
                icon: '',
                entityPicture: '',
                options: [],
            },
        ],
        ['string options', { id: 'entity', options: ['one', 'two'] }],
    ],
    [
        ['missing id', {}],
        ['empty id', { id: '' }],
        ['invalid name', { id: 'entity', name: null }],
        ['invalid icon', { id: 'entity', icon: 1 }],
        ['invalid picture', { id: 'entity', entityPicture: false }],
        ['non-array options', { id: 'entity', options: 'one' }],
        ['invalid option', { id: 'entity', options: ['one', 2] }],
        ['empty option', { id: 'entity', options: [''] }],
        ['unknown field', { id: 'entity', extra: true }],
    ],
);
