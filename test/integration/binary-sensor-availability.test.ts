import { describe, expect, it } from 'vitest';

import { TypedInputTypes } from '../../src/const';
import {
    createControllerHarness,
    setupControllerTestHarnessGlobals,
} from '../helpers/controllerTestHarness';

setupControllerTestHarnessGlobals();

describe('binary_sensor availability integration', function () {
    it('sends binary state with available=true', async function () {
        const harness = createControllerHarness({ kind: 'binary_sensor' });
        await harness.asyncInput({ payload: 'on' });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: 'on',
                available: true,
            }),
        );
    });

    it('sends availability-only update for topic-only trigger', async function () {
        const harness = createControllerHarness({ kind: 'binary_sensor' });
        await harness.asyncInput({ topic: 'trigger' });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                available: true,
            }),
        );
        expect(harness.websocket.send.mock.calls[0][0]).not.toHaveProperty(
            'state',
        );
    });

    it('no-ops when all values resolve missing', async function () {
        const harness = createControllerHarness({
            kind: 'binary_sensor',
            configOverrides: {
                available: 'payload.available',
                availableType: TypedInputTypes.Message,
            },
        });
        await harness.asyncInput({ topic: 'only-topic' });

        expect(harness.websocket.send).not.toHaveBeenCalled();
        expect(harness.node.status).toHaveBeenCalledWith({
            fill: 'grey',
            shape: 'dot',
            text: '',
        });
    });

    it('old companion omits available for default config', async function () {
        const harness = createControllerHarness({
            kind: 'binary_sensor',
            integrationVersion: '4.2.3',
        });
        await harness.asyncInput({ payload: 'off' });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: 'off',
            }),
        );
        expect(harness.websocket.send.mock.calls[0][0]).not.toHaveProperty(
            'available',
        );
    });
});
