import { describe, expect, it } from 'vitest';

import { TypedInputTypes } from '../../src/const';
import {
    createControllerHarness,
    setupControllerTestHarnessGlobals,
} from '../helpers/controllerTestHarness';

setupControllerTestHarnessGlobals();

describe('sensor availability integration', function () {
    it('S1 sends numeric state with available=true', async function () {
        const harness = createControllerHarness({ kind: 'sensor' });
        await harness.asyncInput({ payload: '21.4' });

        expect(harness.websocket.send).toHaveBeenCalledOnce();
        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: '21.4',
                available: true,
            }),
        );
    });

    it('S1s sends string state with available=true', async function () {
        const harness = createControllerHarness({ kind: 'sensor' });
        await harness.asyncInput({ payload: 'running' });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: 'running',
                available: true,
            }),
        );
    });

    it('M6 sends availability-only update for topic-only message', async function () {
        const harness = createControllerHarness({ kind: 'sensor' });
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

    it('M7 no-ops when state/attributes/available are all elided', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            configOverrides: {
                available: 'payload.available',
                availableType: TypedInputTypes.Message,
            },
        });
        const { send, done } = await harness.asyncInput({
            topic: 'only-topic',
        });

        expect(harness.websocket.send).not.toHaveBeenCalled();
        expect(harness.node.status).toHaveBeenCalledWith({
            fill: 'grey',
            shape: 'dot',
            text: '',
        });
        expect(send).toHaveBeenCalledOnce();
        expect(done).toHaveBeenCalledOnce();
    });

    it('V3 omits available on old companion with default config', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            integrationVersion: '4.2.3',
        });
        await harness.asyncInput({ payload: '21.4' });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: '21.4',
            }),
        );
        expect(harness.websocket.send.mock.calls[0][0]).not.toHaveProperty(
            'available',
        );
    });

    it('V5 errors for custom available config on old companion', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            integrationVersion: '4.2.3',
            configOverrides: {
                available: 'payload.connected',
                availableType: TypedInputTypes.Message,
            },
        });
        const { done } = await harness.asyncInput({
            payload: {
                connected: false,
                state: '21.4',
            },
        });

        expect(harness.websocket.send).not.toHaveBeenCalled();
        expect(done).toHaveBeenCalledOnce();
        const err = done.mock.calls[0][0] as Error;
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('4.2.4');
        expect(err.message).toContain('4.2.3');
        expect(err.message).toMatch(/Available needs Node-RED Companion/i);
        expect(harness.node.status).toHaveBeenCalledWith(
            expect.objectContaining({
                fill: 'red',
                shape: 'ring',
                text: expect.stringContaining('companion version'),
            }),
        );
    });

    it.each([
        { id: 'V7-false', available: false },
        { id: 'V7-true', available: true },
    ])(
        '$id errors for message override available=$available on old companion',
        async function ({ available }) {
            const harness = createControllerHarness({
                kind: 'sensor',
                integrationVersion: '4.2.3',
                configOverrides: {
                    inputOverride: 'allow',
                },
            });
            const { done } = await harness.asyncInput({
                payload: {
                    available,
                    state: '21.4',
                },
            });

            expect(harness.websocket.send).not.toHaveBeenCalled();
            expect(done).toHaveBeenCalledOnce();
            const err = done.mock.calls[0][0] as Error;
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toContain('4.2.4');
            expect(err.message).toMatch(/Available needs Node-RED Companion/i);
            expect(harness.node.status).toHaveBeenCalledWith(
                expect.objectContaining({
                    fill: 'red',
                    shape: 'ring',
                    text: expect.stringContaining('companion version'),
                }),
            );
        },
    );

    it('V7 block ignores payload.available on old companion (default config)', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            integrationVersion: '4.2.3',
            configOverrides: {
                inputOverride: 'block',
                state: '21.4',
                stateType: TypedInputTypes.String,
            },
        });
        await harness.asyncInput({
            payload: {
                available: false,
                state: '99',
            },
        });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: '21.4',
            }),
        );
        expect(harness.websocket.send.mock.calls[0][0]).not.toHaveProperty(
            'available',
        );
    });

    it.each([
        { id: 'C1-false', value: false, available: false },
        { id: 'C1-false-str', value: 'false', available: false },
        { id: 'C1-no', value: 'no', available: false },
        { id: 'C1-off', value: 'off', available: false },
        { id: 'C1-disable', value: 'disable', available: false },
        { id: 'C1-0', value: 0, available: false },
        { id: 'C1-0-str', value: '0', available: false },
        { id: 'C2-true', value: true, available: true },
        { id: 'C2-true-str', value: 'true', available: true },
        { id: 'C2-yes', value: 'yes', available: true },
        { id: 'C2-on', value: 'on', available: true },
        { id: 'C2-enable', value: 'enable', available: true },
        { id: 'C2-1', value: 1, available: true },
        { id: 'C2-1-str', value: '1', available: true },
    ])(
        '$id coerces Available to $available',
        async function ({ value, available }) {
            const harness = createControllerHarness({
                kind: 'sensor',
                configOverrides: {
                    available: 'payload.available',
                    availableType: TypedInputTypes.Message,
                    state: 'payload.state',
                    stateType: TypedInputTypes.Message,
                },
            });
            await harness.asyncInput({
                payload: {
                    available: value,
                    state: '21.4',
                },
            });

            expect(harness.websocket.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    state: '21.4',
                    available,
                }),
            );
        },
    );

    it.each([
        { id: 'C5-pebkac', value: 'pebkac' },
        { id: 'C5-unknown', value: 'unknown' },
        { id: 'C5-2', value: 2 },
        { id: 'C5-junk', value: 'junk' },
    ])(
        '$id rejects invalid Available with detailed Catch and short status',
        async function ({ value }) {
            const harness = createControllerHarness({
                kind: 'sensor',
                configOverrides: {
                    available: 'payload.available',
                    availableType: TypedInputTypes.Message,
                    state: 'payload.state',
                    stateType: TypedInputTypes.Message,
                },
            });
            const { done } = await harness.asyncInput({
                payload: {
                    available: value,
                    state: '21.4',
                },
            });

            expect(harness.websocket.send).not.toHaveBeenCalled();
            expect(done).toHaveBeenCalledOnce();
            const err = done.mock.calls[0][0] as Error;
            expect(err.message).toMatch(/Available value .* is invalid/);
            expect(harness.node.status).toHaveBeenCalledWith(
                expect.objectContaining({
                    fill: 'red',
                    shape: 'ring',
                    text: expect.stringContaining('invalid input'),
                }),
            );
        },
    );

    it('O1 allows message available override', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            configOverrides: {
                inputOverride: 'allow',
            },
        });
        await harness.asyncInput({
            payload: {
                available: false,
                state: '21.4',
            },
        });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: '21.4',
                available: false,
            }),
        );
    });

    it('O2 blocks message available override', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            configOverrides: {
                inputOverride: 'block',
                state: '21.4',
                stateType: TypedInputTypes.String,
            },
        });
        await harness.asyncInput({
            payload: {
                available: false,
                state: '21.4',
            },
        });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: '21.4',
                available: true,
            }),
        );
    });

    it('O3 merges configured and message attributes', async function () {
        const harness = createControllerHarness({
            kind: 'sensor',
            configOverrides: {
                inputOverride: 'merge',
                attributes: [
                    {
                        property: 'config_attr',
                        value: 'configured',
                        valueType: TypedInputTypes.String,
                    },
                ],
            },
        });
        await harness.asyncInput({
            payload: {
                state: '21.4',
                attributes: {
                    message_attr: 'from-message',
                },
            },
        });

        expect(harness.websocket.send).toHaveBeenCalledWith(
            expect.objectContaining({
                state: '21.4',
                attributes: {
                    config_attr: 'configured',
                    message_attr: 'from-message',
                },
                available: true,
            }),
        );
    });
});
