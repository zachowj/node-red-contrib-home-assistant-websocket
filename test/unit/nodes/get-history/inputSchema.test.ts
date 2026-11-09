import { inputSchema } from '../../../../src/nodes/get-history';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'get history',
    inputSchema,
    [
        ['missing optional fields', {}],
        [
            'empty dates and relative time',
            { startDate: '', endDate: '', relativeTime: '' },
        ],
        [
            'date strings and coercible boolean',
            {
                startDate: '2024-01-01',
                endDate: '2024-02-01',
                entityId: 'light.a',
                entityIdType: 'equals',
                flatten: 'false',
            },
        ],
        [
            'date objects',
            {
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-02-01'),
            },
        ],
    ],
    [
        ['invalid date', { startDate: 'not-a-date' }],
        ['invalid end date', { endDate: 'not-a-date' }],
        ['empty entity id', { entityId: '' }],
        ['invalid filter type', { entityIdType: 'other' }],
        ['invalid relative time', { relativeTime: 3 }],
        ['invalid boolean', { flatten: 'yes' }],
        ['unknown field', { extra: true }],
    ],
);
