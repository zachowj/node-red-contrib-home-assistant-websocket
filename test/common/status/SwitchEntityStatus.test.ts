import chai, { expect } from 'chai';
import EventEmitter from 'events';
import { NodeAPI } from 'node-red';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import Events, { NodeEvent } from '../../../src/common/events/Events';
import State from '../../../src/common/State';
import SwitchEntityStatus from '../../../src/common/status/SwitchEntityStatus';
import { setRED } from '../../../src/globals';
import { BaseNode, ServerNodeConfig } from '../../../src/types/nodes';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

const fakeNow = new Date(2012, 0, 12, 12, 12, 12);

describe('SwitchEntityStatus', function () {
    let nodeStub: StubbedInstance<BaseNode>;
    let nodeApiStub: StubbedInstance<NodeAPI>;
    let serverNodeConfigStub: StubbedInstance<ServerNodeConfig>;
    let stateStub: StubbedInstance<State>;

    let status: SwitchEntityStatus;
    let nodeEvents: Events;
    let eventEmitter: EventEmitter;

    before(function () {
        nodeApiStub = stubInterface<NodeAPI>();
        nodeStub = stubInterface<BaseNode>();
        serverNodeConfigStub = stubInterface<ServerNodeConfig>();
        stateStub = stubInterface<State>();

        setRED(nodeApiStub);
    });

    beforeEach(function () {
        nodeApiStub._.returnsArg(0);
        nodeStub.status.returns();
        sinon.useFakeTimers(fakeNow.getTime());

        serverNodeConfigStub.statusSeparator = 'at ';
        serverNodeConfigStub.statusYear = 'hidden';
        serverNodeConfigStub.statusMonth = 'short';
        serverNodeConfigStub.statusDay = 'numeric';
        serverNodeConfigStub.statusHourCycle = 'h23';
        serverNodeConfigStub.statusTimeFormat = 'h:m';

        eventEmitter = new EventEmitter();
        nodeEvents = new Events({
            node: nodeStub,
            emitter: eventEmitter,
        });

        status = new SwitchEntityStatus({
            config: serverNodeConfigStub,
            nodeEvents,
            node: nodeStub,
            state: stateStub,
        });
    });

    afterEach(function () {
        sinon.reset();
        resetStubInterface(nodeStub);
        resetStubInterface(stateStub);
    });

    describe('set', function () {
        it('default status should be a yellow dot', function () {
            const expectedStatus = {
                fill: 'yellow',
                shape: 'dot',
                text: '',
            };
            status.set();

            expect(nodeStub.status).to.have.been.calledOnce;
            expect(nodeStub.status).to.have.been.calledOnceWithExactly(
                expectedStatus
            );
        });
    });
    describe('Status for node status', function () {
        it('should have shape dot and text on when node is enabled', function () {
            stateStub.isEnabled.returns(true);
            // force status update
            eventEmitter.emit(NodeEvent.StateChanged);
            expect(nodeStub.status).to.have.been.calledOnce;
            expect(nodeStub.status).to.have.been.calledWithExactly({
                fill: 'yellow',
                shape: 'dot',
                text: 'home-assistant.status.on at Jan 12, 12:12',
            });
        });
        it('should have shape ring and text off when node is disabled', function () {
            stateStub.isEnabled.returns(false);
            // force status update
            eventEmitter.emit(NodeEvent.StateChanged);
            expect(nodeStub.status).to.have.been.calledOnce;
            expect(nodeStub.status).to.have.been.calledWithExactly({
                fill: 'yellow',
                shape: 'ring',
                text: 'home-assistant.status.off at Jan 12, 12:12',
            });
        });
    });
});
