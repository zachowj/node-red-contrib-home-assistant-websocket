import chai, { expect } from 'chai';
import helper from 'node-red-node-test-helper';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { Credentials } from '../../src/homeAssistant';
import nodes from '../../src/index';
import { ServerNode } from '../../src/types/nodes';
import HaServer from '../test-helpers/HaServer';

chai.use(sinonChai);
helper.init(require.resolve('node-red'));

const sn1 = {
    id: 'sn1',
    type: 'server',
    name: 'Home Assistant',
    version: 2,
    addon: false,
    rejectUnauthorizedCerts: true,
    ha_boolean: 'y|yes|true|on|home|open',
    connectionDelay: false,
    cacheJson: true,
    heartbeat: false,
    heartbeatInterval: 30,
};

const host = 'localhost';
const port = 8123;
const creds1 = { host: `http://${host}:${port}`, access_token: '1234567890' };

describe('config-server node', function () {
    let haServer: HaServer;

    before(function (done) {
        haServer = new HaServer({
            host,
            port,
            accessToken: creds1.access_token,
        });
        haServer.start(done);
    });

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        sinon.restore();
        helper.unload();
        helper.stopServer(() => {
            haServer.restore(done);
        });
    });

    after(function (done) {
        haServer.stop(done);
    });

    describe('config', function () {
        it('should be loaded with the correct config', function (done) {
            const flow = [sn1];
            helper.load(nodes, flow, { sn1: creds1 }, async function () {
                const s1 = helper.getNode('sn1') as ServerNode<Credentials>;
                await haServer.waitForConnection;
                expect(s1.id).to.equal('sn1');
                expect(s1.name).to.equal('Home Assistant');
                expect(s1.config.id).to.equal('sn1');
                expect(s1.config.name).to.equal('Home Assistant');
                expect(s1.config.version).to.equal(2);
                expect(s1.config.addon).to.equal(false);
                expect(s1.config.rejectUnauthorizedCerts).to.equal(true);
                expect(s1.config.ha_boolean).to.equal(
                    'y|yes|true|on|home|open'
                );
                expect(s1.config.connectionDelay).to.equal(false);
                expect(s1.config.cacheJson).to.equal(true);
                expect(s1.config.heartbeat).to.equal(false);
                expect(s1.config.heartbeatInterval).to.equal(30);

                done();
            });
        });
    });

    describe('connection', function () {
        it('should connect to the server', function (done) {
            const flow = [sn1];
            helper.load(nodes, flow, { sn1: creds1 }, async function () {
                const s1 = helper.getNode('sn1') as ServerNode<Credentials>;
                await haServer.waitForConnection;
                expect(s1?.controller?.homeAssistant?.isConnected).to.equal(
                    true
                );
                done();
            });
        });

        it('should not connect to the server', function (done) {
            const flow = [sn1];
            helper.load(
                nodes,
                flow,
                {
                    sn1: {
                        host: `http://${host}:${port}`,
                        access_token: 'bad token',
                    },
                },
                async function () {
                    try {
                        await haServer.waitForConnection;
                        done('should not have connected');
                    } catch (err) {
                        done();
                    }
                }
            );
        });
    });

    describe('context', function () {
        it('should set isConnected and isRunning context to false', function (done) {
            const flow = [sn1];
            helper.load(nodes, flow, { sn1: creds1 }, async function () {
                const s1 = helper.getNode('sn1') as ServerNode<Credentials>;
                const spy = sinon.spy(s1.controller, 'setOnContext');
                await haServer.waitForConnection;
                try {
                    expect(spy).to.have.been.called.calledWith(
                        'isConnected',
                        false
                    );
                    expect(spy).to.have.been.called.calledWith(
                        'isRunning',
                        false
                    );
                } catch (err) {
                    done(err);
                }
                done();
            });
        });

        it('isConnected should be false before connection and true after', function (done) {
            const flow = [sn1];
            helper.load(nodes, flow, { sn1: creds1 }, async function () {
                const s1 = helper.getNode('sn1') as ServerNode<Credentials>;
                expect(s1.controller.getFromContext('isConnected')).to.equal(
                    false
                );
                await haServer.waitForConnection;
                expect(s1.controller.getFromContext('isConnected')).to.equal(
                    true
                );
                done();
            });
        });
    });
});
