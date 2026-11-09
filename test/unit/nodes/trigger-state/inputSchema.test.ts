import {
    enableSchema,
    testingSchema,
} from '../../../../src/nodes/trigger-state';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'trigger state enable message',
    enableSchema,
    [
        ['missing payload and unknown field', { topic: 'x' }],
        ['enable', { payload: 'enable' }],
        ['disable', { payload: 'disable' }],
    ],
    [
        ['unknown command', { payload: 'other' }],
        ['non-string payload', { payload: true }],
    ],
);

testSchema(
    'trigger state testing message',
    testingSchema,
    [
        ['missing payload and unknown top-level field', { topic: 'x' }],
        ['entity only', { payload: { entity_id: 'light.a' } }],
        [
            'states allow extra fields',
            {
                payload: {
                    entity_id: 'light.a',
                    old_state: { state: 'off', attributes: {} },
                    new_state: { state: 'on', last_changed: 'now' },
                },
            },
        ],
    ],
    [
        ['missing entity', { payload: {} }],
        ['empty entity', { payload: { entity_id: '' } }],
        [
            'missing old state',
            { payload: { entity_id: 'light.a', old_state: {} } },
        ],
        [
            'missing new state',
            { payload: { entity_id: 'light.a', new_state: {} } },
        ],
        [
            'invalid state',
            { payload: { entity_id: 'light.a', new_state: { state: 1 } } },
        ],
        [
            'unknown payload field',
            { payload: { entity_id: 'light.a', extra: true } },
        ],
    ],
);
