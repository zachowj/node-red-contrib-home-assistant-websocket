import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import Events from '../../../src/common/events/Events';
import State from '../../../src/common/State';
import Status from '../../../src/common/status/Status';
import { BaseNode, ServerNodeConfig } from '../../../src/types/nodes';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

describe('Status', function () {
    let nodeStub: StubbedInstance<BaseNode>;
    let serverNodeConfigStub: StubbedInstance<ServerNodeConfig>;
    let stateStub: StubbedInstance<State>;
    let eventsStub: StubbedInstance<Events>;

    before(function () {
        nodeStub = stubInterface<BaseNode>();
        nodeStub.status.returns();
        serverNodeConfigStub = stubInterface<ServerNodeConfig>();
        stateStub = stubInterface<State>();
        eventsStub = stubInterface<Events>();
    });

    afterEach(function () {
        sinon.reset();
        resetStubInterface(nodeStub);
        resetStubInterface(serverNodeConfigStub);
        resetStubInterface(stateStub);
        resetStubInterface(eventsStub);
    });

    describe('set', function () {
        it('should call updateStatus with defaults and set lastStatus', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                nodeEvents: eventsStub,
                node: nodeStub,
                state: stateStub,
            });
            const expectedStatus = {};
            status.set();

            expect(nodeStub.status).to.have.been.calledOnceWithExactly(
                expectedStatus
            );
        });
    });
    describe('setText', function () {
        it('status should only contain the text property', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                nodeEvents: eventsStub,
                node: nodeStub,
                state: stateStub,
            });

            const expectedStatus = { text: 'hello' };
            status.setText(expectedStatus.text);

            expect(nodeStub.status).to.have.been.calledOnceWithExactly(
                expectedStatus
            );
        });
    });
    describe('updateStatus', function () {
        it('should replace status with disabled status', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                nodeEvents: eventsStub,
                node: nodeStub,
                state: stateStub,
            });
            stateStub.isEnabled.returns(false);
            const sentStatus = {
                fill: 'blue' as const,
                shape: 'ring' as const,
                text: 'hello',
            };
            const expectedStatus = {
                fill: 'grey',
                shape: 'dot',
                text: 'home-assistant.status.disabled',
            };
            status.set(sentStatus);
            expect(nodeStub.status).to.have.been.calledWith(expectedStatus);
        });
    });
});
