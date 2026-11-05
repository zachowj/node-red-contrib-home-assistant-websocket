import { EventEmitter } from 'events';
import { HassEntities, HassEvent } from 'home-assistant-js-websocket';
import { beforeEach, describe, expect, it } from 'vitest';

import Websocket, {
    WebsocketConfig,
} from '../../../src/homeAssistant/Websocket';
import { HassEntityRegistryEntry } from '../../../src/types/home-assistant';

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
