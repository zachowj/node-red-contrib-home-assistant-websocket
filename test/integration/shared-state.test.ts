import { EventEmitter } from 'events';
import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { createControllerDependencies } from '../../src/common/controllers/helpers';
import ClientEvents from '../../src/common/events/ClientEvents';
import ComparatorService from '../../src/common/services/ComparatorService';
import InputService from '../../src/common/services/InputService';
import Status from '../../src/common/status/Status';
import TransformState from '../../src/common/TransformState';
import { TAGS_ALL, TypedInputTypes } from '../../src/const';
import HomeAssistant from '../../src/homeAssistant/HomeAssistant';
import HttpAPI from '../../src/homeAssistant/Http';
import WebsocketAPI, {
    ClientState,
    WebsocketConfig,
} from '../../src/homeAssistant/Websocket';
import CurrentStateController from '../../src/nodes/current-state/CurrentStateController';
import EventsAllController from '../../src/nodes/events-all/EventsAllController';
import EventsStateController from '../../src/nodes/events-state/EventsStateController';
import GetEntitiesController from '../../src/nodes/get-entities/GetEntitiesController';
import PollStateController from '../../src/nodes/poll-state/PollStateController';
import TagController from '../../src/nodes/tag/TagController';
import TriggerStateController from '../../src/nodes/trigger-state/TriggerStateController';
import WaitUntilController from '../../src/nodes/wait-until/WaitUntilController';
import ZoneController from '../../src/nodes/zone/ZoneController';
import { NodeMessage } from '../../src/types/nodes';
import { setupControllerTestHarnessGlobals } from '../helpers/controllerTestHarness';

setupControllerTestHarnessGlobals();

class FakeNode extends EventEmitter {
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

function entity(id: string, state: string, attributes = {}, lastChanged = '') {
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

function seed(states: Record<string, unknown>) {
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

function inputService(parsed: Record<string, { value: unknown }>) {
    const service = mock<InputService<any>>();
    service.parse.mockReturnValue(parsed as never);
    return service;
}

async function sendInput(node: FakeNode, message: NodeMessage) {
    const send = vi.fn();
    const done = vi.fn();
    const handler = node.listeners('input')[0] as (...args: unknown[]) => void;
    await handler(message, send, done);

    return { send, done };
}

const outputProperty = (property: string, valueType: TypedInputTypes) => ({
    property,
    propertyType: 'msg',
    value: '',
    valueType,
});

describe('shared websocket state is never changed by nodes', function () {
    it('current-state transforms a copy and gives the user their own entity', async function () {
        const lastChanged = new Date(Date.now() - 60_000).toISOString();
        const { homeAssistant, websocket } = seed({
            'sensor.temp': entity('sensor.temp', '21.5', {}, lastChanged),
        });
        const before = structuredClone(websocket.states);
        const node = new FakeNode({
            halt_if: '',
            halt_if_type: 'str',
            halt_if_compare: 'is',
            state_type: 'num',
            for: '',
            forType: 'num',
            forUnits: 'minutes',
            outputProperties: [
                outputProperty('data', TypedInputTypes.Entity),
                outputProperty('since', TypedInputTypes.TimeSinceChangedMs),
            ],
        });
        const comparatorService = mock<ComparatorService>();
        comparatorService.getComparatorResult.mockResolvedValue(true);
        // eslint-disable-next-line no-new
        new CurrentStateController({
            node: node as any,
            status: mock<Status>(),
            inputService: inputService({ entityId: { value: 'sensor.temp' } }),
            comparatorService,
            transformState: new TransformState(),
            ...createControllerDependencies(node as any, homeAssistant),
        });

        const { send } = await sendInput(node, { payload: {} });

        const msg = send.mock.calls[0][0][0];
        expect(msg.data.state).toBe('21.5');
        expect(msg.since).toBeGreaterThanOrEqual(60_000);

        const cached = websocket.states['sensor.temp'];
        expect(msg.data).not.toBe(cached);
        expect(msg.data.attributes).not.toBe(cached.attributes);
        expect(websocket.states).toEqual(before);
    });

    it('get-entities returns copies of the cached entities', async function () {
        const { homeAssistant, websocket } = seed({
            'sensor.a': entity('sensor.a', 'on'),
            'sensor.b': entity('sensor.b', 'off'),
        });
        const before = structuredClone(websocket.states);
        const node = new FakeNode({});
        // eslint-disable-next-line no-new
        new GetEntitiesController({
            node: node as any,
            status: mock<Status>(),
            inputService: inputService({
                rules: { value: [] },
                outputType: { value: 'array' },
                outputEmptyResults: { value: true },
                outputLocationType: { value: 'msg' },
                outputLocation: { value: 'payload' },
                outputResultsCount: { value: 1 },
            }),
            comparatorService: mock<ComparatorService>(),
            ...createControllerDependencies(node as any, homeAssistant),
        });

        const { send } = await sendInput(node, { payload: {} });

        const msg = send.mock.calls[0][0];
        expect(msg.payload).toHaveLength(2);
        for (const result of msg.payload) {
            const cached = websocket.states[result.entity_id];
            expect(result).toEqual(cached);
            expect(result).not.toBe(cached);
            expect(result.attributes).not.toBe(cached.attributes);
        }

        msg.payload[0].state = 'changed';
        expect(websocket.states).toEqual(before);
    });

    it('zone sends copies of the event and zones', function () {
        const home = entity('zone.home', 'zoning', {
            latitude: 0,
            longitude: 0,
            radius: 100,
        });
        const outside = entity('person.jason', 'not_home', {
            latitude: 1,
            longitude: 1,
        });
        const inside = entity('person.jason', 'home', {
            latitude: 0,
            longitude: 0,
        });
        const { homeAssistant, websocket } = seed({
            'zone.home': home,
            'person.jason': inside,
        });
        const before = structuredClone(websocket.states);
        const node = new FakeNode({
            entities: ['person.jason'],
            zones: ['zone.home'],
            event: 'enter',
        });
        const controller = new ZoneController({
            node: node as any,
            status: mock<Status>(),
            ...createControllerDependencies(node as any, homeAssistant),
        });
        const event = {
            event_type: 'state_changed',
            entity_id: 'person.jason',
            event: {
                entity_id: 'person.jason',
                old_state: outside,
                new_state: inside,
            },
        };

        controller.onStateChanged(event as never);

        const msg = node.send.mock.calls[0][0];
        expect(msg.data).toEqual(event.event);
        expect(msg.data).not.toBe(event.event);
        expect(msg.data.new_state).not.toBe(inside);
        expect(msg.zones).toHaveLength(1);
        expect(msg.zones[0]).not.toBe(websocket.states['zone.home']);

        msg.zones[0].state = 'changed';
        expect(websocket.states).toEqual(before);
    });

    it('poll-state transforms a copy and calculates timeSinceChangedMs', async function () {
        const lastChanged = new Date(Date.now() - 60_000).toISOString();
        const { homeAssistant, websocket } = seed({
            'sensor.temp': entity('sensor.temp', '21.5', {}, lastChanged),
        });
        const before = structuredClone(websocket.states);
        const node = new FakeNode({
            entityId: 'sensor.temp',
            stateType: 'num',
            ifState: '',
            ifStateType: 'str',
            ifStateOperator: 'is',
            outputProperties: [
                outputProperty('data', TypedInputTypes.Entity),
                outputProperty('since', TypedInputTypes.TimeSinceChangedMs),
            ],
        });
        const controller = new PollStateController({
            node: node as any,
            status: mock<Status>(),
            comparatorService: mock<ComparatorService>(),
            transformState: new TransformState(),
            ...createControllerDependencies(node as any, homeAssistant),
        });

        await controller.onTimer();

        const msg = node.send.mock.calls[0][0][0];
        expect(msg.data.state).toBe('21.5');
        expect(msg.since).toBeGreaterThanOrEqual(60_000);
        expect(msg.data.attributes).not.toBe(
            websocket.states['sensor.temp'].attributes,
        );
        expect(websocket.states).toEqual(before);
    });

    describe('events-state', function () {
        function setup(configOverrides: Record<string, unknown> = {}) {
            const { homeAssistant, websocket } = seed({});
            const node = new FakeNode({
                entities: { entity: ['sensor.temp'], substring: [], regex: [] },
                stateType: 'num',
                for: '',
                forType: 'num',
                forUnits: 'seconds',
                ifState: '',
                ifStateType: 'str',
                ifStateOperator: 'is',
                outputOnlyOnStateChange: false,
                outputProperties: [
                    outputProperty('data', TypedInputTypes.Entity),
                    outputProperty('prev', TypedInputTypes.PrevEntity),
                ],
                ...configOverrides,
            });
            const controller = new EventsStateController({
                node: node as any,
                status: mock<Status>(),
                comparatorService: mock<ComparatorService>(),
                transformState: new TransformState(),
                ...createControllerDependencies(node as any, homeAssistant),
            });

            return { controller, node, websocket };
        }

        const stateChanged = () => ({
            event_type: 'state_changed',
            entity_id: 'sensor.temp',
            event: {
                entity_id: 'sensor.temp',
                old_state: entity('sensor.temp', '20'),
                new_state: entity('sensor.temp', '21.5'),
            },
        });

        it('transforms copies and leaves the event untouched', async function () {
            const { controller, node } = setup();
            const evt = stateChanged();
            const before = structuredClone(evt);

            await controller.onHaEventsStateChanged(evt as never);

            const msg = node.send.mock.calls[0][0][0];
            expect(msg.data.state).toBe('21.5');
            expect(msg.prev.state).toBe('20');
            expect(evt).toEqual(before);
        });

        it('sends the original event data after the states map is replaced', async function () {
            vi.useFakeTimers();
            try {
                const { controller, node, websocket } = setup({ for: '1' });
                await controller.onHaEventsStateChanged(
                    stateChanged() as never,
                );
                expect(node.send).not.toHaveBeenCalled();

                websocket.onClientEvents({
                    event_type: 'state_changed',
                    data: {
                        entity_id: 'sensor.temp',
                        new_state: entity('sensor.temp', '99'),
                    },
                } as never);
                await vi.advanceTimersByTimeAsync(1000);

                const msg = node.send.mock.calls[0][0][0];
                expect(msg.data.state).toBe('21.5');
                expect(msg.prev.state).toBe('20');
            } finally {
                vi.useRealTimers();
            }
        });
    });

    describe('trigger-state', function () {
        function setup(configOverrides: Record<string, unknown> = {}) {
            const { homeAssistant, websocket } = seed({});
            const node = new FakeNode({
                entities: { entity: ['sensor.list'], substring: [], regex: [] },
                stateType: 'list',
                constraints: [],
                customOutputs: [],
                ...configOverrides,
            });
            const comparatorService = mock<ComparatorService>();
            comparatorService.getComparatorResult.mockResolvedValue(true);
            const controller = new TriggerStateController({
                node: node as any,
                status: mock<Status>(),
                inputService: mock<InputService<any>>(),
                comparatorService,
                transformState: new TransformState(),
                ...createControllerDependencies(node as any, homeAssistant),
            });

            return { comparatorService, controller, node, websocket };
        }

        const stateChanged = () => ({
            event_type: 'state_changed',
            entity_id: 'sensor.list',
            event: {
                entity_id: 'sensor.list',
                old_state: entity('sensor.list', 'a'),
                new_state: entity('sensor.list', 'a,b'),
            },
        });

        it('sends copies of the transformed event and keeps the input intact', async function () {
            const { controller, node } = setup();
            const evt = stateChanged();
            const before = structuredClone(evt);

            await controller.onEntityStateChanged(evt as never);

            const msg = node.send.mock.calls[0][0][0];
            expect(msg.payload).toBe('a,b');
            expect(msg.data.event.new_state.state).toBe('a,b');
            expect(msg.data.event.new_state.attributes).not.toBe(
                evt.event.new_state.attributes,
            );

            msg.data.event.new_state.attributes.list.push(3);
            expect(evt).toEqual(before);
        });

        it('copies failed comparators before sending', async function () {
            const constraint = {
                targetType: 'this_entity',
                targetValue: '',
                propertyType: 'current_state',
                propertyValue: 'state',
                comparatorType: 'is',
                comparatorValueDatatype: 'str',
                comparatorValue: 'nope',
            };
            const { comparatorService, controller, node } = setup({
                constraints: [constraint],
            });
            comparatorService.getComparatorResult.mockResolvedValue(false);

            await controller.onEntityStateChanged(stateChanged() as never);

            const msg = node.send.mock.calls[0][0][1];
            expect(msg.failedComparators).toHaveLength(1);
            expect(msg.failedComparators[0].constraint).toEqual(constraint);
            expect(msg.failedComparators[0].constraint).not.toBe(constraint);
        });
    });

    describe('wait-until', function () {
        const lastChanged = new Date(Date.now() - 60_000).toISOString();

        function setup({
            checkCurrentState,
            timeout,
        }: {
            checkCurrentState: boolean;
            timeout: string;
        }) {
            const { homeAssistant, websocket } = seed({
                'sensor.temp': entity('sensor.temp', '21', {}, lastChanged),
            });
            const node = new FakeNode({
                entities: {
                    entity: ['sensor.temp'],
                    substring: [],
                    regex: [],
                },
                timeoutType: 'num',
                outputProperties: [
                    outputProperty('data', TypedInputTypes.Entity),
                    outputProperty('since', TypedInputTypes.TimeSinceChangedMs),
                ],
            });
            const comparatorService = mock<ComparatorService>();
            const parsed = {
                entities: {
                    value: {
                        entity: ['sensor.temp'],
                        substring: [],
                        regex: [],
                    },
                    source: 'default',
                },
                entityId: { value: undefined, source: 'default' },
                property: { value: 'state' },
                comparator: { value: 'is' },
                value: { value: '21' },
                valueType: { value: 'str' },
                timeout: { value: timeout, source: 'config' },
                timeoutUnits: { value: 'seconds' },
                checkCurrentState: { value: checkCurrentState },
            };
            // eslint-disable-next-line no-new
            new WaitUntilController({
                node: node as any,
                status: mock<Status>(),
                inputService: inputService(parsed as never),
                comparatorService,
                clientEvents: mock<ClientEvents>(),
                ...createControllerDependencies(node as any, homeAssistant),
            });

            return { comparatorService, node, websocket };
        }

        it('sends a copy of the current entity when it already matches', async function () {
            const { comparatorService, node, websocket } = setup({
                checkCurrentState: true,
                timeout: '0',
            });
            comparatorService.getComparatorResult.mockResolvedValue(true);
            const before = structuredClone(websocket.states);

            const { send } = await sendInput(node, { payload: {} });

            const msg = send.mock.calls[0][0][0];
            expect(msg.data).toEqual(websocket.states['sensor.temp']);
            expect(msg.data).not.toBe(websocket.states['sensor.temp']);
            expect(msg.since).toBeGreaterThanOrEqual(60_000);

            msg.data.attributes.list.push(3);
            expect(websocket.states).toEqual(before);
        });

        it('sends a copy of the cached entity on timeout', async function () {
            vi.useFakeTimers();
            try {
                const { comparatorService, node, websocket } = setup({
                    checkCurrentState: false,
                    timeout: '1',
                });
                comparatorService.getComparatorResult.mockResolvedValue(false);
                const before = structuredClone(websocket.states);

                const { send } = await sendInput(node, { payload: {} });
                await vi.advanceTimersByTimeAsync(1000);

                const msg = send.mock.calls[0][0][1];
                expect(msg.data).toEqual(websocket.states['sensor.temp']);
                expect(msg.data).not.toBe(websocket.states['sensor.temp']);

                msg.data.attributes.list.push(3);
                expect(websocket.states).toEqual(before);
            } finally {
                vi.useRealTimers();
            }
        });
    });

    describe('tag and events-all', function () {
        it('tag gives the user a copy of the event data', async function () {
            const { homeAssistant, websocket } = seed({});
            websocket.tags = [];
            const node = new FakeNode({
                tags: [TAGS_ALL],
                devices: [],
                outputProperties: [
                    outputProperty('data', TypedInputTypes.EventData),
                ],
            });
            const controller = new TagController({
                node: node as any,
                status: mock<Status>(),
                ...createControllerDependencies(node as any, homeAssistant),
            });
            const evt = {
                event_type: 'tag_scanned',
                context: { user_id: 'user' },
                event: { device_id: 'device', tag_id: 'tag', extra: { a: 1 } },
            };
            const before = structuredClone(evt);

            await controller.onTagScanned(evt as never);

            const msg = node.send.mock.calls[0][0];
            expect(msg.data).toMatchObject(evt.event);
            expect(msg.data.extra).not.toBe(evt.event.extra);

            msg.data.extra.a = 2;
            expect(evt).toEqual(before);
        });

        it('events-all gives the user a copy of the event', async function () {
            const { homeAssistant } = seed({});
            const node = new FakeNode({
                outputProperties: [
                    outputProperty('data', TypedInputTypes.EventData),
                ],
            });
            const controller = new EventsAllController({
                node: node as any,
                status: mock<Status>(),
                ...createControllerDependencies(node as any, homeAssistant),
            });
            const evt = {
                event_type: 'custom_event',
                event: { nested: { a: 1 } },
            };
            const before = structuredClone(evt);

            await controller.onHaEventsAll(evt as never);

            const msg = node.send.mock.calls[0][0];
            expect(msg.data).toEqual(evt);
            expect(msg.data).not.toBe(evt);
            expect(msg.data.event.nested).not.toBe(evt.event.nested);

            msg.data.event.nested.a = 2;
            expect(evt).toEqual(before);
        });
    });
});
