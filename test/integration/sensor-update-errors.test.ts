import { describe, expect, it } from 'vitest';

import {
    createControllerHarness,
    setupControllerTestHarnessGlobals,
} from '../helpers/controllerTestHarness';

setupControllerTestHarnessGlobals();

const UPDATE_ERRORS = [
    {
        name: 'Home Assistant rejects the value',
        error: { code: 'invalid_format', message: 'Not a number' },
        message: 'Not a number',
        status: 'validation error',
    },
    {
        name: 'unexpected companion error',
        error: { code: 'unknown_error', message: 'Unknown error' },
        message: 'Unknown error',
        status: 'error',
    },
    {
        name: 'connection lost before the reply',
        error: { code: 3, message: 'Connection lost' },
        message: 'Connection lost',
        status: 'error',
    },
    {
        name: 'not connected when sending',
        error: new Error('Client is not connected'),
        message: 'Client is not connected',
        status: 'Error',
    },
];

describe('sensor update errors', function () {
    it.each(UPDATE_ERRORS)(
        'fails the node and leaves the resend payload unchanged: $name',
        async function ({ error, message, status }) {
            const harness = createControllerHarness({
                kind: 'sensor',
                resend: true,
            });
            await harness.asyncInput({ payload: '21' });
            const confirmed = harness.state.getLastPayload();
            expect(confirmed).toMatchObject({ state: '21' });
            harness.reset();

            harness.websocket.send.mockRejectedValueOnce(error);
            const { done, send } = await harness.asyncInput({
                payload: 'abc',
            });

            expect(done).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ message }),
            );
            expect(send).not.toHaveBeenCalled();
            expect(harness.node.status).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    fill: 'red',
                    text: expect.stringContaining(status),
                }),
            );
            expect(harness.state.getLastPayload()).toEqual(confirmed);
        },
    );

    it('stores an accepted update for resend', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            resend: true,
        });
        await harness.asyncInput({ payload: '21' });
        await harness.asyncInput({ payload: '22' });

        expect(harness.state.getLastPayload()).toMatchObject({ state: '22' });
    });
});
