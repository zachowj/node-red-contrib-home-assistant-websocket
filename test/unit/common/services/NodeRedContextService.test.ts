import { Node, NodeAPI, NodeContext, NodeMessage } from 'node-red';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import NodeRedContextService, {
    ContextLocation,
    isContextLocation,
} from '../../../../src/common/services/NodeRedContextService';
import { setRED } from '../../../../src/globals';

describe('Node-RED Context Service', function () {
    let nodeApiStub: MockProxy<NodeAPI>;
    let nodeStub: MockProxy<Node>;
    let nodeRedContextService: NodeRedContextService;
    let nodeContext: NodeContext;

    beforeAll(function () {
        nodeApiStub = mock<NodeAPI>();
        nodeStub = mock<Node>();
        nodeContext = mock<NodeContext>();
        setRED(nodeApiStub);

        nodeRedContextService = new NodeRedContextService(nodeStub);
    });

    afterEach(function () {
        mockReset(nodeApiStub);
        mockReset(nodeStub);
        mockReset(nodeContext);
    });

    describe('isContextLocation', function () {
        it('should return true for valid context location', function () {
            expect(isContextLocation('msg')).toEqual(true);
            expect(isContextLocation('flow')).toEqual(true);
            expect(isContextLocation('global')).toEqual(true);
        });

        it('should return false for invalid context location', function () {
            expect(isContextLocation('invalid')).toEqual(false);
        });
    });

    describe('get', function () {
        describe('msg', function () {
            it('should return value from msg context', function () {
                const message = {
                    payload: 'test',
                };

                nodeApiStub.util.getMessageProperty = vi
                    .fn()
                    .mockReturnValue('test');
                const result = nodeRedContextService.get(
                    'msg',
                    'payload',
                    message,
                );

                expect(result).toEqual(message.payload);
            });

            it('should return undefined if message property is not found', function () {
                const message = {
                    payload: 'test',
                };

                nodeApiStub.util.getMessageProperty = vi
                    .fn()
                    .mockReturnValue(undefined);
                const result = nodeRedContextService.get(
                    'msg',
                    'topic',
                    message,
                );

                expect(result).toEqual(undefined);
            });

            it('should return undefined if message is not provided', function () {
                const result = nodeRedContextService.get('msg', 'payload');

                expect(result).toEqual(undefined);
            });
        });

        describe('flow', function () {
            beforeAll(function () {
                nodeApiStub.util.parseContextStore = vi.fn().mockReturnValue({
                    key: 'foo',
                });
            });

            it('should return value from flow context', function () {
                nodeContext.flow.get = vi.fn().mockReturnValue('test');
                nodeStub.context.mockReturnValue(nodeContext);

                const result = nodeRedContextService.get('flow', 'foo');
                expect(result).toEqual('test');
            });

            it('should return undefined if flow context is not found', function () {
                nodeContext.flow.get = vi.fn().mockReturnValue(undefined);
                nodeStub.context.mockReturnValue(nodeContext);

                const result = nodeRedContextService.get('flow', 'foo');
                expect(result).toEqual(undefined);
            });
        });

        describe('global', function () {
            it('should return value from global context', function () {
                nodeContext.global.get = vi.fn().mockReturnValue('test');
                nodeStub.context.mockReturnValue(nodeContext);

                const result = nodeRedContextService.get('global', 'foo');
                expect(result).toEqual('test');
            });

            it('should return undefined if global context is not found', function () {
                nodeContext.global.get = vi.fn().mockReturnValue(undefined);
                nodeStub.context.mockReturnValue(nodeContext);

                const result = nodeRedContextService.get('global', 'foo');
                expect(result).toEqual(undefined);
            });
        });
    });

    describe('set', function () {
        beforeAll(function () {
            nodeApiStub.util.parseContextStore = vi.fn().mockReturnValue({
                key: 'payload',
            });
        });

        describe('msg', function () {
            beforeAll(function () {
                nodeApiStub.util.setObjectProperty = vi.fn();
            });

            afterEach(function () {
                mockReset(nodeApiStub.util.setObjectProperty);
            });

            it('should set value in msg context', function () {
                const message: NodeMessage = {};
                nodeRedContextService.set(
                    'foo',
                    ContextLocation.Msg,
                    'payload',
                    message,
                );
                expect(nodeApiStub.util.setObjectProperty).toHaveBeenCalledWith(
                    message,
                    'payload',
                    'foo',
                );
            });

            it('should not set message property if message is not provided', function () {
                nodeRedContextService.set(
                    'msg',
                    ContextLocation.Msg,
                    'payload',
                );
                expect(
                    nodeApiStub.util.setObjectProperty,
                ).toHaveBeenCalledTimes(0);
            });
        });
        describe('flow', function () {
            it.skip('should set value in flow context');
        });
        describe('global', function () {
            it.skip('should set value in global context');
        });
    });
});
