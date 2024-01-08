import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import Status from '../../../src/common/status/Status';
import { BaseNode, ServerNodeConfig } from '../../../src/types/nodes';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

describe('Status', function () {
    let nodeStub: StubbedInstance<BaseNode>;
    let serverNodeConfigStub: StubbedInstance<ServerNodeConfig>;

    before(function () {
        nodeStub = stubInterface<BaseNode>();
        nodeStub.status.returns();
        serverNodeConfigStub = stubInterface<ServerNodeConfig>();
    });

    afterEach(function () {
        sinon.reset();
        resetStubInterface(nodeStub);
        resetStubInterface(serverNodeConfigStub);
    });

    describe('set', function () {
        it('should call updateStatus with defaults and set lastStatus', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                node: nodeStub,
            });
            const expectedStatus = {};
            status.set();

            expect(nodeStub.status).to.have.been.calledOnceWithExactly(
                expectedStatus,
            );
        });
    });
    describe('setText', function () {
        it('status should only contain the text property', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                node: nodeStub,
            });

            const expectedStatus = { text: 'hello' };
            status.setText(expectedStatus.text);

            expect(nodeStub.status).to.have.been.calledOnceWithExactly(
                expectedStatus,
            );
        });
    });
});
