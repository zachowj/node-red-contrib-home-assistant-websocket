import { inputSchema } from '../../../../src/nodes/action';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'action',
    inputSchema,
    [
        ['empty data', { action: 'light.turn_on', data: '' }],
        [
            'object data and unknown top-level field',
            { action: 'a', data: { brightness: 1 }, extra: true },
        ],
        [
            'target strings and arrays',
            {
                action: 'a',
                data: {},
                target: {
                    floor_id: 'f',
                    area_id: ['a'],
                    device_id: ['d'],
                    entity_id: 'e',
                    label_id: ['l'],
                },
            },
        ],
        [
            'target arrays allow arbitrary items',
            { action: 'a', data: {}, target: { entity_id: [1, null] } },
        ],
    ],
    [
        ['missing action', { data: {} }],
        ['empty action', { action: '', data: {} }],
        ['missing data', { action: 'a' }],
        ['null data', { action: 'a', data: null }],
        ['array data', { action: 'a', data: [] }],
        [
            'unknown target field',
            { action: 'a', data: {}, target: { other: 'x' } },
        ],
        [
            'invalid target value',
            { action: 'a', data: {}, target: { entity_id: 1 } },
        ],
    ],
);
