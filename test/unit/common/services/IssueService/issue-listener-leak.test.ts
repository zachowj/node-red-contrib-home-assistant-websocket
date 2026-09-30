import { EventEmitter } from 'events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import issueService from '../../../../../src/common/services/IssueService';
import { setRED } from '../../../../../src/globals';
import { homeAssistantConnections } from '../../../../../src/homeAssistant';

vi.mock('../../../../../src/common/services/StorageService', () => ({
    default: { getIssues: () => [], saveIssues: () => {} },
}));

describe('IssueService listener cleanup', () => {
    let redEvents: EventEmitter;
    let eventBus: EventEmitter;

    beforeEach(() => {
        vi.useFakeTimers();
        redEvents = new EventEmitter();
        eventBus = new EventEmitter();
        eventBus.setMaxListeners(0);
    });

    afterEach(() => {
        redEvents.removeAllListeners();
        eventBus.removeAllListeners();
        homeAssistantConnections.delete('srv1');
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('keeps one devices_updated listener while a deviceId issue persists', () => {
        const nodes = [
            { id: 'tab1', type: 'tab' },
            {
                id: 'act1',
                type: 'api-call-service',
                z: 'tab1',
                server: 'srv1',
                action: 'light.turn_on',
                entityId: [],
                deviceId: ['missing-device'],
                areaId: [],
                floorId: [],
                labelId: [],
                data: '',
            },
        ];
        let deviceExists = false;

        setRED({
            events: redEvents,
            nodes: {
                getNode: (id: string) => ({ id }),
                eachNode: (cb: any) => nodes.forEach(cb),
            },
            log: { debug: () => {} },
            _: (k: string) => k,
        } as any);

        homeAssistantConnections.set('srv1', {
            eventBus,
            websocket: {
                isAllRegistriesLoaded: true,
                isStatesLoaded: true,
                getServices: () => ({ light: { turn_on: {} } }),
                getDevice: () =>
                    deviceExists ? { id: 'missing-device' } : undefined,
                getArea: () => undefined,
                getEntity: () => undefined,
                getFloor: () => undefined,
                getLabel: () => undefined,
                getState: () => undefined,
            },
        } as any);

        issueService.init();
        redEvents.emit('flows:started', {
            type: 'full',
            config: { flows: nodes, rev: '1' },
        });

        expect(eventBus.listenerCount('devices_updated')).toBe(1);

        for (let i = 0; i < 10; i++) {
            eventBus.emit('devices_updated', []);
            expect(eventBus.listenerCount('devices_updated')).toBe(1);
        }

        deviceExists = true;
        eventBus.emit('devices_updated', []);
        expect(eventBus.listenerCount('devices_updated')).toBe(0);
    });
});
