const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { SwitchEntityStatus } = require('../../src/services/status');

const expect = chai.expect;
chai.use(sinonChai);

const fakeNode = {
    status: () => {},
};
const fakeNow = new Date(2012, 0, 12, 12, 12, 12);

describe('SwitchEntityStatus', function () {
    beforeEach(function () {
        sinon.spy(fakeNode, 'status');
    });
    afterEach(function () {
        sinon.restore();
    });

    describe('set', function () {
        it('default should be yellow dot', function () {
            const status = new SwitchEntityStatus({
                node: fakeNode,
                nodeState: true,
            });
            const expectedStatus = {
                fill: 'yellow',
                shape: 'dot',
                text: '',
            };
            const spy = sinon.spy(status, 'updateStatus');
            status.set();

            expect(spy).to.have.been.calledOnceWithExactly(expectedStatus);
        });
    });
    describe('setNodeState', function () {
        beforeEach(function () {
            sinon.useFakeTimers(fakeNow.getTime());
        });

        it('should have shape dot and text on when node is enabled', function () {
            const status = new SwitchEntityStatus({
                node: fakeNode,
                nodeState: true,
            });
            const expectedStatus = {
                fill: 'yellow',
                shape: 'dot',
                text: 'on at: Jan 12, 12:12',
            };
            const spy = sinon.spy(status, 'updateStatus');
            status.setNodeState(true);

            expect(spy).to.have.been.calledOnceWithExactly(expectedStatus);
        });
        it('should have shape ring and text off when node is disabled', function () {
            const status = new SwitchEntityStatus({
                node: fakeNode,
                nodeState: true,
            });
            const expectedStatus = {
                fill: 'yellow',
                shape: 'ring',
                text: 'off at: Jan 12, 12:12',
            };
            const spy = sinon.spy(status, 'updateStatus');
            status.setNodeState(false);

            expect(spy).to.have.been.calledOnceWithExactly(expectedStatus);
        });
    });
    describe('updateStatus', function () {
        it('should call node status', function () {
            const status = new SwitchEntityStatus({
                node: fakeNode,
                nodeState: true,
            });
            status.updateStatus();
            expect(fakeNode.status).to.have.been.calledOnce;
        });
    });
});
