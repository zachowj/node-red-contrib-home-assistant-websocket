const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
    STATE_CONNECTED,
    STATE_CONNECTING,
    STATE_DISCONNECTED,
    STATE_ERROR,
    STATE_RUNNING,
} = require('../../src/const');
const { EventsStatus } = require('../../src/services/status');

const expect = chai.expect;
chai.use(sinonChai);

const fakeNode = {
    status: () => {},
};
const fakeHA = {
    addListener: () => {},
    removeListener: () => {},
};

describe('EventsStatus', function () {
    beforeEach(function () {
        sinon.spy(fakeNode, 'status');
        sinon.spy(fakeHA, 'addListener');
        sinon.spy(fakeHA, 'removeListener');
    });
    afterEach(function () {
        sinon.restore();
    });

    describe('set', function () {
        it('should initialize with defaults', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            expect(status.isNodeDisabled).to.be.false;
            expect(status.connectionState).to.be.equal(STATE_DISCONNECTED);
            expect(fakeHA.addListener).to.have.callCount(5);
        });
    });
    describe('Event Listeners', function () {
        describe('onClientClose', function () {
            it('should set connection state to disconnected and call updateConnectionStatus once', function () {
                const status = new EventsStatus({
                    node: fakeNode,
                    nodeState: true,
                    homeAssistant: fakeHA,
                });
                const spy = sinon.spy(status, 'updateConnectionStatus');
                status.onClientClose();

                expect(status.connectionState).to.be.equal(STATE_DISCONNECTED);
                expect(spy).to.be.calledOnce;
            });
        });
        describe('onClientConnection', function () {
            it('should set connection state to connecting and call updateConnectionStatus once', function () {
                const status = new EventsStatus({
                    node: fakeNode,
                    nodeState: true,
                    homeAssistant: fakeHA,
                });
                const spy = sinon.spy(status, 'updateConnectionStatus');
                status.onClientConnecting();

                expect(status.connectionState).to.be.equal(STATE_CONNECTING);
                expect(spy).to.be.calledOnce;
            });
        });
        describe('onClientOpen', function () {
            it('should set connection state to connected and call updateConnectionStatus once', function () {
                const status = new EventsStatus({
                    node: fakeNode,
                    nodeState: true,
                    homeAssistant: fakeHA,
                });
                const spy = sinon.spy(status, 'updateConnectionStatus');
                status.onClientOpen();

                expect(status.connectionState).to.be.equal(STATE_CONNECTED);
                expect(spy).to.be.calledOnce;
            });
        });
        describe('onClientRunning', function () {
            it('should set connection state to running and call updateConnectionStatus once', function () {
                const status = new EventsStatus({
                    node: fakeNode,
                    nodeState: true,
                    homeAssistant: fakeHA,
                });
                const spy = sinon.spy(status, 'updateConnectionStatus');
                status.onClientRunning();

                expect(status.connectionState).to.be.equal(STATE_RUNNING);
                expect(spy).to.be.calledOnce;
            });
        });
    });
    describe('getConnectionStatus', function () {
        it('should return disconnected status object', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            const expectedStatus = {
                fill: 'red',
                shape: 'ring',
                text: 'config-server.status.disconnected',
            };
            status.connectionState = STATE_DISCONNECTED;
            const result = status.getConnectionStatus();

            expect(result).to.be.eql(expectedStatus);
        });
        it('should return connected status object', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            const expectedStatus = {
                fill: 'green',
                shape: 'ring',
                text: 'config-server.status.connected',
            };
            status.connectionState = STATE_CONNECTED;
            const result = status.getConnectionStatus();

            expect(result).to.be.eql(expectedStatus);
        });
        it('should return connecting status object', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            const expectedStatus = {
                fill: 'yellow',
                shape: 'ring',
                text: 'config-server.status.connecting',
            };
            status.connectionState = STATE_CONNECTING;
            const result = status.getConnectionStatus();

            expect(result).to.be.eql(expectedStatus);
        });
        it('should return error status object', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            const expectedStatus = {
                fill: 'red',
                shape: 'ring',
                text: 'config-server.status.error',
            };
            status.connectionState = STATE_ERROR;
            const result = status.getConnectionStatus();

            expect(result).to.be.eql(expectedStatus);
        });
        it('should return running status object', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            const expectedStatus = {
                fill: 'green',
                shape: 'ring',
                text: 'config-server.status.running',
            };
            status.connectionState = STATE_RUNNING;
            const result = status.getConnectionStatus();

            expect(result).to.be.eql(expectedStatus);
        });
    });
    describe('destroy', function () {
        it('should remove 5 events', function () {
            const status = new EventsStatus({
                node: fakeNode,
                nodeState: true,
                homeAssistant: fakeHA,
            });
            status.destroy();
            expect(fakeHA.addListener).to.have.callCount(5);
        });
    });
});
