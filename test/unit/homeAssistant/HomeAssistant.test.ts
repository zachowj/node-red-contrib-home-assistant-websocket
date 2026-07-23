import { EventEmitter } from 'events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

import HomeAssistant from '../../../src/homeAssistant/HomeAssistant';
import HttpAPI from '../../../src/homeAssistant/Http';
import WebsocketAPI from '../../../src/homeAssistant/Websocket';

describe('HomeAssistant entity refs', function () {
    let homeAssistant: HomeAssistant;
    let websocket: MockProxy<WebsocketAPI>;

    beforeEach(function () {
        websocket = mock<WebsocketAPI>();
        homeAssistant = new HomeAssistant({
            websocketAPI: websocket,
            httpAPI: mock<HttpAPI>(),
            eventBus: new EventEmitter(),
        });
    });

    afterEach(function () {
        vi.useRealTimers();
    });

    it('acquire and release track the ref count', function () {
        expect(homeAssistant.entityRefCount).toBe(0);

        homeAssistant.acquireEntityRef();
        homeAssistant.acquireEntityRef();
        expect(homeAssistant.entityRefCount).toBe(2);

        homeAssistant.releaseEntityRef();
        expect(homeAssistant.entityRefCount).toBe(1);

        homeAssistant.releaseEntityRef();
        expect(homeAssistant.entityRefCount).toBe(0);
    });

    it('release below zero is a no-op', function () {
        homeAssistant.releaseEntityRef();
        expect(homeAssistant.entityRefCount).toBe(0);
    });

    it('close with no refs closes the websocket immediately', async function () {
        await homeAssistant.close();
        expect(websocket.close).toHaveBeenCalledOnce();
    });

    it('close waits until entity refs are released', async function () {
        homeAssistant.acquireEntityRef();

        let closed = false;
        const closing = homeAssistant.close({ timeoutMs: 5_000 }).then(() => {
            closed = true;
        });

        await Promise.resolve();
        expect(closed).toBe(false);
        expect(websocket.close).not.toHaveBeenCalled();

        homeAssistant.releaseEntityRef();
        await closing;

        expect(closed).toBe(true);
        expect(websocket.close).toHaveBeenCalledOnce();
    });

    it('close times out and closes with refs still held', async function () {
        vi.useFakeTimers();
        homeAssistant.acquireEntityRef();

        const closing = homeAssistant.close({ timeoutMs: 100 });
        await vi.advanceTimersByTimeAsync(100);
        await closing;

        expect(homeAssistant.entityRefCount).toBe(1);
        expect(websocket.close).toHaveBeenCalledOnce();
    });
});
