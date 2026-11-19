import { describe, expect, it } from 'vitest';

import {
    createControllerHarness,
    setupControllerTestHarnessGlobals,
} from '../helpers/controllerTestHarness';

setupControllerTestHarnessGlobals();

describe('non-finite sensor state', function () {
    it.each([
        { kind: 'sensor' as const, value: NaN },
        { kind: 'sensor' as const, value: Infinity },
        { kind: 'sensor' as const, value: -Infinity },
        { kind: 'binary_sensor' as const, value: NaN },
    ])(
        '$kind rejects $value without sending it',
        async function ({ kind, value }) {
            const harness = createControllerHarness({ kind });

            const { done, send } = await harness.asyncInput({
                payload: value,
            });

            expect(harness.websocket.send).not.toHaveBeenCalled();
            expect(send).not.toHaveBeenCalled();
            expect(done).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: `State ${value} is not a finite number`,
                }),
            );
            expect(harness.node.status).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    fill: 'red',
                    text: expect.stringContaining('validation error'),
                }),
            );
        },
    );
});
