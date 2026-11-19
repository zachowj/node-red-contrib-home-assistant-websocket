import { EventEmitter } from 'events';
import {
    Connection,
    ERR_CONNECTION_LOST,
    HassEntities,
    HassEvent,
} from 'home-assistant-js-websocket';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ClientEvents from '../../../src/common/events/ClientEvents';
import { Credentials } from '../../../src/homeAssistant';
import Websocket, {
    ClientState,
    WebsocketConfig,
} from '../../../src/homeAssistant/Websocket';
import EditorContext from '../../../src/nodes/config-server/EditorContext';
import { HassEntityRegistryEntry } from '../../../src/types/home-assistant';
import { ServerNode } from '../../../src/types/nodes';

function entity(id: string, state: string) {
    return { entity_id: id, state, attributes: { list: [1] } };
}

describe('Websocket state access', function () {
    let websocket: Websocket;

    beforeEach(function () {
        websocket = new Websocket({} as WebsocketConfig, new EventEmitter());
        websocket.states = {
            'sensor.a': entity('sensor.a', 'on'),
        } as unknown as HassEntities;
    });

    it('returns the cached objects without copying', function () {
        expect(websocket.getStates()).toBe(websocket.states);
        expect(websocket.getState('sensor.a')).toBe(
            websocket.states['sensor.a'],
        );
    });

    it('replaces the states map on a state_changed event', function () {
        const before = websocket.getStates();
        const newState = entity('sensor.a', 'off');

        websocket.onClientEvents({
            event_type: 'state_changed',
            data: { entity_id: 'sensor.a', new_state: newState },
        } as unknown as HassEvent);

        expect(websocket.getState('sensor.a')).toBe(newState);
        expect(websocket.getStates()).not.toBe(before);
        expect(before['sensor.a'].state).toBe('on');
    });

    it('keeps global context synchronized with entity subscription updates', function () {
        const eventBus = new EventEmitter();
        const contextSet = vi.fn();
        const globalContext = {
            get: vi.fn(),
            set: contextSet,
        };
        const node = Object.assign(new EventEmitter(), {
            config: { name: 'server' },
            context: () => ({ global: globalContext }),
            error: vi.fn(),
        }) as unknown as ServerNode<Credentials>;
        const clientEvents = new ClientEvents({ node, emitter: eventBus });
        const editorContext = new EditorContext(node, clientEvents);

        const websocket = new Websocket({} as WebsocketConfig, eventBus);
        const initialStates = {
            'sensor.a': entity('sensor.a', 'on'),
        } as unknown as HassEntities;
        const updatedStates = {
            ...initialStates,
            'sensor.a': entity('sensor.a', 'off'),
        } as unknown as HassEntities;

        websocket.onClientStates(initialStates);
        websocket.onClientStates(updatedStates);

        expect(editorContext).toBeInstanceOf(EditorContext);
        expect(contextSet).toHaveBeenLastCalledWith(
            'homeassistant.server.states',
            updatedStates,
        );
    });

    it('replaces the entity registry and drops removed entities', function () {
        const registryEntry = (id: string) =>
            ({ entity_id: id }) as HassEntityRegistryEntry;

        websocket.onClientEntityRegistry([
            registryEntry('sensor.a'),
            registryEntry('sensor.b'),
        ]);
        const before = websocket.getEntities();

        websocket.onClientEntityRegistry([registryEntry('sensor.a')]);

        expect(websocket.getEntity('sensor.b')).toBeUndefined();
        expect(websocket.getEntity('sensor.a')).toBeDefined();
        expect(websocket.getEntities()).not.toBe(before);
        expect(before.has('sensor.b')).toBe(true);
    });
});

describe('Websocket send errors', function () {
    function connectedWebsocket(rejection: unknown) {
        const websocket = new Websocket(
            {} as WebsocketConfig,
            new EventEmitter(),
        );
        websocket.connectionState = ClientState.Connected;
        websocket.client = {
            sendMessagePromise: vi.fn().mockRejectedValue(rejection),
        } as unknown as Connection;
        return websocket;
    }

    it.each([
        {
            name: 'in-flight request when the connection drops',
            rejection: {
                type: 'result',
                success: false,
                error: {
                    code: ERR_CONNECTION_LOST,
                    message: 'Connection lost',
                },
            },
        },
        {
            name: 'queued request when reconnecting fails',
            rejection: ERR_CONNECTION_LOST,
        },
    ])(
        'rejects a lost connection as an API error: $name',
        async function ({ rejection }) {
            await expect(
                connectedWebsocket(rejection).send({ type: 'test' }),
            ).rejects.toEqual({
                code: ERR_CONNECTION_LOST,
                message: 'Connection lost',
            });
        },
    );

    it('passes API errors through unchanged', async function () {
        const apiError = { code: 'invalid_format', message: 'Not a number' };

        await expect(
            connectedWebsocket(apiError).send({ type: 'test' }),
        ).rejects.toBe(apiError);
    });
});
