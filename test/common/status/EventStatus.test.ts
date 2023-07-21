import chai, { expect } from 'chai';
import EventEmitter from 'events';
import { NodeAPI } from 'node-red';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import ClientEvents from '../../../src/common/events/ClientEvents';
import Events from '../../../src/common/events/Events';
import State from '../../../src/common/State';
import EventsStatus from '../../../src/common/status/EventStatus';
import { setRED } from '../../../src/globals';
import { ClientEvent } from '../../../src/homeAssistant/Websocket';
import { BaseNode, ServerNodeConfig } from '../../../src/types/nodes';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

describe('EventsStatus', function () {
    let eventsStub: StubbedInstance<Events>;
    let nodeStub: StubbedInstance<BaseNode>;
    let nodeApiStub: StubbedInstance<NodeAPI>;
    let serverNodeConfigStub: StubbedInstance<ServerNodeConfig>;
    let stateStub: StubbedInstance<State>;
    let clientEvents: ClientEvents;
    let eventEmitter: EventEmitter;

    before(function () {
        nodeApiStub = stubInterface<NodeAPI>();
        eventsStub = stubInterface<Events>();
        nodeStub = stubInterface<BaseNode>();
        serverNodeConfigStub = stubInterface<ServerNodeConfig>();
        stateStub = stubInterface<State>();

        setRED(nodeApiStub);
    });

    beforeEach(function () {
        nodeApiStub._.returnsArg(0);
        nodeStub.status.returns();

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
        sinon.reset();
        resetStubInterface(nodeApiStub);
        resetStubInterface(nodeStub);
        resetStubInterface(serverNodeConfigStub);
        resetStubInterface(stateStub);
        resetStubInterface(eventsStub);
    });

    describe('constructor', function () {
        it('should setup event listeners', function () {
            const clientEventsStub = stubInterface<ClientEvents>();
            // eslint-disable-next-line no-new
            new EventsStatus({
                node: nodeStub,
                config: serverNodeConfigStub,
                clientEvents: clientEventsStub,
            });
            expect(clientEventsStub.addListeners).to.be.called;
            eventEmitter.emit(ClientEvent.Close);
            eventEmitter.emit(ClientEvent.Connecting);
            eventEmitter.emit(ClientEvent.Error);
            eventEmitter.emit(ClientEvent.Open);
            eventEmitter.emit(ClientEvent.Running);
            expect(nodeStub.status).callCount(5);
        });
    });
    describe('Event Listeners', function () {
        it('should set connection state to disconnected and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Close);
            expect(nodeStub.status).to.be.calledOnce;
            expect(nodeStub.status).to.be.calledWithExactly({
                fill: 'red',
                shape: 'ring',
                text: 'home-assistant.status.disconnected',
            });
        });
        it('should set connection state to connecting and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Connecting);
            expect(nodeStub.status).to.be.calledOnce;
            expect(nodeStub.status).to.be.calledWithExactly({
                fill: 'yellow',
                shape: 'ring',
                text: 'home-assistant.status.connecting',
            });
        });
        it('should set connection state to connected and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Open);
            expect(nodeStub.status).to.be.calledOnce;
            expect(nodeStub.status).to.be.calledWithExactly({
                fill: 'green',
                shape: 'ring',
                text: 'home-assistant.status.connected',
            });
        });
        it('should set connection state to running and call updateConnectionStatus', function () {
            eventEmitter.emit(ClientEvent.Running);
            expect(nodeStub.status).to.be.calledOnce;
            expect(nodeStub.status).to.be.calledWithExactly({
                fill: 'green',
                shape: 'ring',
                text: 'home-assistant.status.running',
            });
        });
    });
});
