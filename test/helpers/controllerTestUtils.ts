import { EventEmitter } from 'events';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import InputService from '../../src/common/services/InputService';
import HomeAssistant from '../../src/homeAssistant/HomeAssistant';
import HttpAPI from '../../src/homeAssistant/Http';
import WebsocketAPI, {
    ClientState,
    WebsocketConfig,
} from '../../src/homeAssistant/Websocket';
import { NodeMessage } from '../../src/types/nodes';

export class FakeNode extends EventEmitter {
    id = 'node_1';
    status = vi.fn();
    debug = vi.fn();
    warn = vi.fn();
    error = vi.fn();
    send = vi.fn();

    constructor(public config: Record<string, any>) {
        super();
    }

    context() {
        return { get: vi.fn(), set: vi.fn() };
    }
}

export function entity(
    id: string,
    state: string,
    attributes = {},
    lastChanged = '',
) {
    const timestamp = lastChanged || new Date().toISOString();
    return {
        entity_id: id,
        state,
        attributes: { list: [1, 2], ...attributes },
        last_changed: timestamp,
        last_updated: timestamp,
        context: { id: '1', parent_id: null, user_id: null },
    };
}

export function seed(states: Record<string, unknown>) {
    const eventBus = new EventEmitter();
    const websocket = new WebsocketAPI({} as WebsocketConfig, eventBus);
    websocket.states = states as WebsocketAPI['states'];
    websocket.connectionState = ClientState.Connected;
    websocket.isHomeAssistantRunning = true;
    const homeAssistant = new HomeAssistant({
        websocketAPI: websocket,
        httpAPI: mock<HttpAPI>(),
        eventBus,
    });

    return { homeAssistant, websocket };
}

export function inputService(parsed: Record<string, { value: unknown }>) {
    const service = mock<InputService<any>>();
    service.parse.mockReturnValue(parsed as never);
    return service;
}

export async function sendInput(node: FakeNode, message: NodeMessage) {
    const send = vi.fn();
    const done = vi.fn();
    const handler = node.listeners('input')[0] as (...args: unknown[]) => void;
    await handler(message, send, done);

    return { send, done };
}
