import { Connection, HassEvent } from 'home-assistant-js-websocket';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeEntityRegistry } from '../../../src/homeAssistant/collections';

describe('Home Assistant registry collections', function () {
    const connectionLost = {
        type: 'result',
        success: false,
        error: { code: 3, message: 'Connection lost' },
    };

    function setup() {
        let updateHandler: ((event: HassEvent) => void) | undefined;
        const sendMessagePromise = vi
            .fn()
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce(connectionLost);
        const mockConnection = {
            connected: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            sendMessagePromise,
            subscribeEvents: vi.fn((handler: (event: HassEvent) => void) => {
                updateHandler = handler;
                return Promise.resolve(vi.fn());
            }),
        };
        const connection = mockConnection as unknown as Connection;

        subscribeEntityRegistry(connection, vi.fn());

        return {
            connection: mockConnection,
            runUpdate: () => {
                if (!updateHandler) {
                    throw new Error(
                        'Registry update handler was not registered',
                    );
                }

                return (updateHandler as unknown as () => Promise<void>)();
            },
            sendMessagePromise,
        };
    }

    beforeEach(function () {
        vi.useRealTimers();
    });

    it('handles a registry fetch rejected after disconnect', async function () {
        const { connection, runUpdate, sendMessagePromise } = setup();
        connection.connected = false;

        await expect(runUpdate()).resolves.toBeUndefined();
        expect(sendMessagePromise).toHaveBeenCalledTimes(2);
    });

    it('preserves fetch errors while the connection is still live', async function () {
        const { runUpdate } = setup();

        await expect(runUpdate()).rejects.toEqual(connectionLost);
    });
});
