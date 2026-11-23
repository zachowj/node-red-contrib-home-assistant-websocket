import { EventEmitter } from 'events';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import createSocket from '../../../src/homeAssistant/createSocket';

type FakeSocket = EventEmitter & { close: Mock };

const { FakeWebSocket } = await vi.hoisted(async () => {
    const { EventEmitter } = await import('events');

    class FakeWebSocket extends EventEmitter {
        static instances: FakeSocket[] = [];

        close = vi.fn(() => this.emit('close'));
        send = vi.fn();
        terminate = vi.fn();

        constructor() {
            super();
            FakeWebSocket.instances.push(this);
        }
    }

    return { FakeWebSocket };
});

vi.mock('ws', () => ({ default: FakeWebSocket }));

const options = {
    auth: { type: 'auth', access_token: 'token' },
    connectionDelay: false,
    eventBus: new EventEmitter(),
    rejectUnauthorizedCerts: true,
    url: 'ws://localhost:8123/api/websocket',
};

describe('createSocket', function () {
    beforeEach(function () {
        vi.useFakeTimers();
        FakeWebSocket.instances = [];
    });

    afterEach(function () {
        vi.useRealTimers();
    });

    it('should close and retry when the auth phase receives invalid JSON', async function () {
        const promise = createSocket(options);
        await vi.advanceTimersByTimeAsync(0);
        const [socket] = FakeWebSocket.instances;
        socket.emit('open');

        expect(() =>
            socket.emit('message', Buffer.from('{nuLl'), false),
        ).not.toThrow();
        expect(socket.close).toHaveBeenCalledOnce();

        await vi.advanceTimersByTimeAsync(5000);
        expect(FakeWebSocket.instances).toHaveLength(2);

        FakeWebSocket.instances[1].emit(
            'message',
            Buffer.from(
                JSON.stringify({ type: 'auth_ok', ha_version: '2026.11.0' }),
            ),
            false,
        );
        await expect(promise).resolves.toBe(FakeWebSocket.instances[1]);
    });
});
