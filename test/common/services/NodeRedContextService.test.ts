import chai, { expect } from 'chai';
import { afterEach, before } from 'mocha';
import { Node, NodeAPI, NodeContext, NodeMessage } from 'node-red';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import NodeRedContextService, {
    ContextLocation,
    isContextLocation,
} from '../../../src/common/services/NodeRedContextService';
import { setRED } from '../../../src/globals';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

describe('Node-RED Context Service', function () {
    let nodeApiStub: StubbedInstance<NodeAPI>;
    let nodeStub: StubbedInstance<Node>;
    let nodeRedContextService: NodeRedContextService;
    let nodeContext: NodeContext;

    before(function () {
        nodeApiStub = stubInterface<NodeAPI>();
        nodeStub = stubInterface<Node>();
        nodeContext = stubInterface<NodeContext>();
        setRED(nodeApiStub);

        nodeRedContextService = new NodeRedContextService(nodeStub);
    });

    afterEach(function () {
        sinon.restore();
        resetStubInterface(nodeApiStub);
        resetStubInterface(nodeStub);
        resetStubInterface(nodeContext);
    });

    describe('isContextLocation', function () {
        it('should return true for valid context location', function () {
            expect(isContextLocation('msg')).to.be.true;
            expect(isContextLocation('flow')).to.be.true;
            expect(isContextLocation('global')).to.be.true;
        });

        it('should return false for invalid context location', function () {
            expect(isContextLocation('invalid')).to.be.false;
        });
    });

    describe('get', function () {
        describe('msg', function () {
            it('should return value from msg context', function () {
                const message = {
                    payload: 'test',
                };

                nodeApiStub.util.getMessageProperty = sinon
                    .stub()
                    .returns('test');
                const result = nodeRedContextService.get(
                    'msg',
                    'payload',
                    message
                );

                expect(result).to.equal(message.payload);
            });
            it('should return undefined if message property is not found', function () {
                const message = {
                    payload: 'test',
                };

                nodeApiStub.util.getMessageProperty = sinon
                    .stub()
                    .returns(undefined);
                const result = nodeRedContextService.get(
                    'msg',
                    'topic',
                    message
                );

                expect(result).to.be.undefined;
            });
            it('should return undefined if message is not provided', function () {
                const result = nodeRedContextService.get('msg', 'payload');

                expect(result).to.be.undefined;
            });
        });
        describe('flow', function () {
            before(function () {
                nodeApiStub.util.parseContextStore = sinon.stub().returns({
                    key: 'foo',
                });
            });
            it('should return value from flow context', function () {
                nodeContext.flow.get = sinon.stub().returns('test');
                nodeStub.context.returns(nodeContext);

                const result = nodeRedContextService.get('flow', 'foo');
                expect(result).to.equal('test');
            });
            it('should return undefined if flow context is not found', function () {
                nodeContext.flow.get = sinon.stub().returns(undefined);
                nodeStub.context.returns(nodeContext);

                const result = nodeRedContextService.get('flow', 'foo');
                expect(result).to.be.undefined;
            });
        });
        describe('global', function () {
            it('should return value from global context', function () {
                nodeContext.global.get = sinon.stub().returns('test');
                nodeStub.context.returns(nodeContext);

                const result = nodeRedContextService.get('global', 'foo');
                expect(result).to.equal('test');
            });
            it('should return undefined if global context is not found', function () {
                nodeContext.global.get = sinon.stub().returns(undefined);
                nodeStub.context.returns(nodeContext);

                const result = nodeRedContextService.get('global', 'foo');
                expect(result).to.be.undefined;
            });
        });
    });

    describe('set', function () {
        before(function () {
            nodeApiStub.util.parseContextStore = sinon.stub().returns({
                key: 'payload',
            });
        });
        describe('msg', function () {
            let setObjectPropertyStub: sinon.SinonStub;
            before(function () {
                setObjectPropertyStub = sinon.stub();
                nodeApiStub.util.setObjectProperty = setObjectPropertyStub;
            });
            afterEach(function () {
                setObjectPropertyStub.reset();
            });
            it('should set value in msg context', function () {
                const message: NodeMessage = {};
                nodeRedContextService.set(
                    'foo',
                    ContextLocation.Msg,
                    'payload',
                    message
                );
                expect(setObjectPropertyStub).to.have.been.calledOnceWith(
                    message,
                    'payload',
                    'foo'
                );
            });
            it('should not set message property if message is not provided', function () {
                nodeRedContextService.set(
                    'msg',
                    ContextLocation.Msg,
                    'payload'
                );
                expect(setObjectPropertyStub).to.not.have.been.called;
            });
        });
        // describe('flow', function () {
        //     it('should set value in flow context');
        // });
        // describe('global', function () {
        //     it('should set value in global context');
        // });
    });
});
