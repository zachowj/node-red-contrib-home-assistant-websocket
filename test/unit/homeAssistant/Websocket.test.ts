import { HassEntities } from 'home-assistant-js-websocket';
import { describe, expect, it } from 'vitest';

import Websocket from '../../../src/homeAssistant/Websocket';

describe('Websocket state access', function () {
    it('keeps getStates as an independent snapshot', function () {
        const websocket = Object.create(Websocket.prototype) as Websocket;
        websocket.states = {
            'sensor.example': {
                entity_id: 'sensor.example',
                state: 'on',
            },
        } as HassEntities;

        const snapshot = websocket.getStates();
        snapshot['sensor.example'].state = 'off';

        expect(websocket.getState('sensor.example')?.state).toBe('on');
    });

    it('provides the current map to explicitly read-only internal consumers', function () {
        const websocket = Object.create(Websocket.prototype) as Websocket;
        websocket.states = {
            'sensor.example': {
                entity_id: 'sensor.example',
                state: 'on',
            },
        } as HassEntities;

        expect(websocket.getStatesReadOnly()).toBe(websocket.states);
    });
});
