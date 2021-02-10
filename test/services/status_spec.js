const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { Status } = require('../../src/services/status');

const expect = chai.expect;
chai.use(sinonChai);

const fakeNode = {
    status: () => {},
};
const fakeNow = new Date(2012, 0, 12, 12, 12, 12);

describe('Status', function () {
    beforeEach(function () {
        sinon.spy(fakeNode, 'status');
    });
    afterEach(function () {
        sinon.restore();
    });

    it('should initialize with isNodeDisabled false with empty constructor', function () {
        const status = new Status({});
        expect(status.isNodeDisabled).to.be.false;
    });
    it('should initialize with isNodeDisabled true', function () {
        const status = new Status({ node: fakeNode, nodeState: false });
        expect(status.isNodeDisabled).to.be.true;
    });
    it('should initialize with isNodeDisabled false', function () {
        const status = new Status({ node: fakeNode, nodeState: true });
        expect(status.isNodeDisabled).to.be.false;
    });
    describe('setNodeState', function () {
        it('should inverse the passed in value', function () {
            const status = new Status({ nodeState: true });
            status.setNodeState(true);
            expect(status.isNodeDisabled).to.be.false;
        });
        it('should call updateStatus after changing the state', function () {
            const status = new Status({ node: fakeNode, nodeState: true });
            const spy = sinon.spy(status, 'updateStatus');
            status.setNodeState(false);
            expect(spy).to.have.been.calledOnce;
            expect(fakeNode.status).to.have.been.calledOnce;
        });
        it('should not call updateStatus if the passed in value does not change the state', function () {
            const status = new Status({ node: fakeNode, nodeState: true });
            const spy = sinon.spy(status, 'updateStatus');
            status.setNodeState(true);
            expect(spy).to.not.have.been.called;
            expect(fakeNode.status).to.not.have.been.called;
        });
    });
    describe('set', function () {
        it('should call updateStatus with defaults and set lastStatus', function () {
            const status = new Status({ node: fakeNode, nodeState: true });
            const expectedStatus = {
                fill: 'blue',
                shape: 'dot',
                text: '',
            };
            const spy = sinon.spy(status, 'updateStatus');
            status.set();

            expect(spy).to.have.been.calledOnceWithExactly(expectedStatus);
            expect(status.lastStatus).to.eql(expectedStatus);
        });
        it('should not set lastStatus when node is disabled', function () {
            const status = new Status({
                node: fakeNode,
                nodeState: false,
            });
            status.set();

            expect(status.lastStatus).to.eql({});
        });
    });
    describe('setText', function () {
        it('status should only contain the text property', function () {
            const status = new Status({
                node: fakeNode,
                nodeState: true,
            });
            const expectedStatus = {
                fill: null,
                shape: null,
                text: 'hello',
            };
            const spy = sinon.spy(status, 'updateStatus');
            status.setText(expectedStatus.text);

            expect(spy).to.have.been.calledOnceWithExactly(expectedStatus);
        });
    });
    describe('updateStatus', function () {
        it('should replace status with disabled status', function () {
            const status = new Status({
                node: fakeNode,
                nodeState: false,
            });
            const sentStatus = {
                fill: 'blue',
                shape: 'ring',
                text: 'hello',
            };
            const expectedStatus = {
                fill: 'grey',
                shape: 'dot',
                text: 'config-server.status.disabled',
            };
            status.updateStatus(sentStatus);

            expect(fakeNode.status).to.have.been.calledOnceWithExactly(
                expectedStatus
            );
        });
    });
    describe('appendDateString', function () {
        it('should add datestring to end of text', function () {
            sinon.useFakeTimers(fakeNow.getTime());
            const status = new Status({
                node: fakeNode,
                nodeState: false,
            });
            const result = status.appendDateString('hello');
            expect(result).to.equal('hello at: Jan 12, 12:12');
        });
    });
});
