import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import State from '../../src/common/State';
import Storage from '../../src/common/Storage';
import { BaseNode } from '../../src/types/nodes';

chai.use(sinonChai);

describe('Node State Class', function () {
    let nodeStub: StubbedInstance<BaseNode>;
    let getNodeData: sinon.SinonStub;

    before(function () {
        nodeStub = stubInterface<BaseNode>();
        getNodeData = sinon.stub(Storage, 'getNodeData');
        getNodeData.withArgs('nodeId', 'isEnabled').resolves(undefined);
        getNodeData.withArgs('nodeId', 'lastPayload').resolves(undefined);
    });

    afterEach(function () {
        sinon.reset();
    });

    describe('constructor', function () {
        it('should set the initial state', function () {
            const state = new State(nodeStub);
            expect(state.isEnabled()).to.be.true;
            expect(getNodeData).to.have.been.callCount(2);
        });
        it('should return payload as undefined', function () {
            const state = new State(nodeStub);
            expect(state.getLastPayload()).to.be.undefined;
            expect(getNodeData).to.have.been.callCount(2);
        });
    });
    describe('setEnabled', function () {
        it('should set the node state to false', function () {
            const state = new State(nodeStub);
            state.setEnabled(false);
            expect(state.isEnabled()).to.be.false;
        });
        it('should set the node state to true', function () {
            const state = new State(nodeStub);
            state.setEnabled(true);
            expect(state.isEnabled()).to.be.true;
        });
    });
    describe('isEnabled', function () {
        it('should return the node is disabled', function () {
            const state = new State(nodeStub);
            state.setEnabled(false);
            expect(state.isEnabled()).to.be.false;
        });
        it('should return that the node is enabled', function () {
            const state = new State(nodeStub);
            state.setEnabled(true);
            expect(state.isEnabled()).to.be.true;
        });
    });
    describe('setLastPayload', function () {
        it('should set the last payload', function () {
            const state = new State(nodeStub);
            state.setLastPayload({
                state: 'foo',
                attributes: {
                    foo: 'bar',
                },
            });
            expect(state.getLastPayload()).to.deep.equal({
                state: 'foo',
                attributes: {
                    foo: 'bar',
                },
            });
        });
    });
});
