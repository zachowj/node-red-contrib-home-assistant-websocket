import chai, { expect } from 'chai';
import { NodeAPI } from 'node-red';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import Events from '../../../src/common/events/Events';
import State from '../../../src/common/State';
import { setRED } from '../../../src/globals';
import { EntityConfigNode } from '../../../src/nodes/entity-config';
import { SwitchNode, SwitchNodeProperties } from '../../../src/nodes/switch';
import SwitchStatus from '../../../src/nodes/switch/SwitchStatus';
import { ServerNodeConfig } from '../../../src/types/nodes';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

const fakeNow = new Date(2012, 0, 12, 12, 12, 12);

describe('SwitchEntityStatus', function () {
    let entityConfigEvents: StubbedInstance<Events>;
    let entityConfigNode: StubbedInstance<EntityConfigNode>;
    let nodeStub: StubbedInstance<SwitchNode>;
    let nodeApiStub: StubbedInstance<NodeAPI>;
    let serverNodeConfigStub: StubbedInstance<ServerNodeConfig>;
    let stateStub: StubbedInstance<State>;
    let switchNodeConfigStub: StubbedInstance<SwitchNodeProperties>;

    let status: SwitchStatus;

    before(function () {
        entityConfigEvents = stubInterface<Events>();
        entityConfigNode = stubInterface<EntityConfigNode>();
        nodeApiStub = stubInterface<NodeAPI>();
        nodeStub = stubInterface<SwitchNode>();
        serverNodeConfigStub = stubInterface<ServerNodeConfig>();
        stateStub = stubInterface<State>();
        switchNodeConfigStub = stubInterface<SwitchNodeProperties>();

        setRED(nodeApiStub);
    });

    beforeEach(function () {
        nodeApiStub._.returnsArg(0);
        nodeStub.status.returns();
        sinon.useFakeTimers(fakeNow.getTime());

        nodeStub.config = switchNodeConfigStub;

        serverNodeConfigStub.statusSeparator = 'at ';
        serverNodeConfigStub.statusYear = 'hidden';
        serverNodeConfigStub.statusMonth = 'short';
        serverNodeConfigStub.statusDay = 'numeric';
        serverNodeConfigStub.statusHourCycle = 'h23';
        serverNodeConfigStub.statusTimeFormat = 'h:m';

        entityConfigNode.state = stateStub;

        status = new SwitchStatus({
            entityConfigEvents,
            entityConfigNode,
            config: serverNodeConfigStub,
            node: nodeStub,
        });
    });

    afterEach(function () {
        sinon.reset();
        resetStubInterface(nodeStub);
        resetStubInterface(stateStub);
        resetStubInterface(entityConfigNode);
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
                expectedStatus,
            );
        });
    });
});
