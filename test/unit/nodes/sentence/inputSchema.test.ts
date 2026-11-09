import { expect, it } from 'vitest';

import InputService from '../../../../src/common/services/InputService';
import { inputSchema } from '../../../../src/nodes/sentence';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'sentence',
    inputSchema,
    [
        [
            'fixed response',
            { response: 'hello', responseType: 'fixed', responseId: 1 },
        ],
        [
            'dynamic response and numeric string id',
            { response: 'payload', responseType: 'msg', responseId: '42' },
        ],
        [
            'dynamic response type',
            { response: 'x', responseType: 'dynamic', responseId: 0 },
        ],
    ],
    [
        ['missing response', { responseType: 'fixed', responseId: 1 }],
        [
            'empty response',
            { response: '', responseType: 'fixed', responseId: 1 },
        ],
        ['missing response type', { response: 'x', responseId: 1 }],
        [
            'invalid response type',
            { response: 'x', responseType: 'other', responseId: 1 },
        ],
        ['missing response id', { response: 'x', responseType: 'fixed' }],
        [
            'invalid response id',
            {
                response: 'x',
                responseType: 'fixed',
                responseId: 'not-a-number',
            },
        ],
        [
            'unknown field',
            {
                response: 'x',
                responseType: 'fixed',
                responseId: 1,
                extra: true,
            },
        ],
    ],
);

it('preserves the custom error for a missing sentence response id', function () {
    expect(() =>
        InputService.validateSchema(inputSchema, {
            response: 'x',
            responseType: 'fixed',
        }),
    ).toThrow('_sentence_response_id was not found in the message object');
});
