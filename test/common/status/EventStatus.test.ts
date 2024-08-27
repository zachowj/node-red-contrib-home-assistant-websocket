import EventEmitter from 'events';
import { NodeAPI } from 'node-red';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import ClientEvents from '../../../src/common/events/ClientEvents';
import Events from '../../../src/common/events/Events';
import State from '../../../src/common/State';
import EventsStatus from '../../../src/common/status/EventStatus';
import { setRED } from '../../../src/globals';
import { ClientEvent } from '../../../src/homeAssistant/Websocket';
import { BaseNode, ServerNodeConfig } from '../../../src/types/nodes';

describe('EventsStatus', function () {
    let eventsStub: MockProxy<Events>;
    let nodeStub: MockProxy<BaseNode>;
    let nodeApiStub: MockProxy<NodeAPI>;
    let serverNodeConfigStub: MockProxy<ServerNodeConfig>;
    let stateStub: MockProxy<State>;
    let clientEvents: ClientEvents;
    let eventEmitter: EventEmitter;

    beforeAll(function () {
        nodeApiStub = mock<NodeAPI>();
        eventsStub = mock<Events>();
        nodeStub = mock<BaseNode>();
        serverNodeConfigStub = mock<ServerNodeConfig>();
        stateStub = mock<State>();

        setRED(nodeApiStub);
    });

    beforeEach(function () {
        nodeApiStub._.mockReturnValue('0');
        nodeStub.status.mockReturnValue();

        eventEmitter = new EventEmitter();
        clientEvents = new ClientEvents({
            node: nodeStub,
            emitter: eventEmitter,
        });

        // eslint-disable-next-line no-new
        new EventsStatus({
            node: nodeStub,
            config: serverNodeConfigStub,
            clientEvents,
        });
    });

    afterEach(function () {
        mockReset(nodeApiStub);
        mockReset(nodeStub);
        mockReset(serverNodeConfigStub);
        mockReset(stateStub);
        mockReset(eventsStub);
    });

    describe('constructor', function () {
        it('should setup event listeners', function () {
            const clientEventsStub = mock<ClientEvents>();
            // eslint-disable-next-line no-new
            new EventsStatus({
                node: nodeStub,
                config: serverNodeConfigStub,
                clientEvents: clientEventsStub,
            });
            expect(clientEventsStub.addListeners).toBeCalledTimes(1);
            eventEmitter.emit(ClientEvent.Close);
            eventEmitter.emit(ClientEvent.Connecting);
            eventEmitter.emit(ClientEvent.Error);
            eventEmitter.emit(ClientEvent.Open);
            eventEmitter.emit(ClientEvent.Running);
            expect(nodeStub.status).toBeCalledTimes(5);
        });
    });

    describe('Event Listeners', function () {
        it('should set connection state to disconnected and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Close);
            expect(nodeStub.status).toBeCalledTimes(1);
            expect(nodeStub.status).toBeCalledWith({
                fill: 'red',
                shape: 'ring',
                text: 'home-assistant.status.disconnected',
            });
        });

        it('should set connection state to connecting and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Connecting);
            expect(nodeStub.status).toBeCalledTimes(1);
            expect(nodeStub.status).toBeCalledWith({
                fill: 'yellow',
                shape: 'ring',
                text: 'home-assistant.status.connecting',
            });
        });

        it('should set connection state to connected and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Open);
            expect(nodeStub.status).toBeCalledTimes(1);
            expect(nodeStub.status).toBeCalledWith({
                fill: 'green',
                shape: 'ring',
                text: 'home-assistant.status.connected',
            });
        });

        it('should set connection state to running and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Running);
            expect(nodeStub.status).toBeCalledTimes(1);
            expect(nodeStub.status).toBeCalledWith({
                fill: 'green',
                shape: 'ring',
                text: 'home-assistant.status.running',
            });
        });
    });
});
