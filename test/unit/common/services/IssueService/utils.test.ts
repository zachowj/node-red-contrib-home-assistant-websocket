import { NodeDef } from 'node-red';
import { describe, expect, it, test } from 'vitest';

import { IssueType } from '../../../../../src/common/services/IssueService';
import {
    getServerId,
    includesIssue,
    isDynamicValue,
    isHomeAssistantNode,
    isIssuesEqual,
} from '../../../../../src/common/services/IssueService/utils';
import { NodeType } from '../../../../../src/const';
import { BaseNodeProperties } from '../../../../../src/types/nodes';

describe('utils', function () {
    describe('getServerId', function () {
        it('should return node id when node type is Server', function () {
            const node = {
                type: NodeType.Server,
                id: 'server1',
            } as BaseNodeProperties;
            expect(getServerId(node)).toEqual('server1');
        });

        it('should return node.server when node type is not Server', function () {
            const node = { server: 'server1' } as BaseNodeProperties;
            expect(getServerId(node)).toEqual('server1');
        });
    });

    describe('includesIssue', function () {
        it('should return true when the issue is included in the array', function () {
            const issues = [
                { type: IssueType.EntityId, identity: '1', message: 'test' },
            ];
            const issue = {
                type: IssueType.EntityId,
                identity: '1',
                message: 'test',
            };
            expect(includesIssue(issues, issue)).toEqual(true);
        });

        it('should return false when the issue is not included in the array', function () {
            const issues = [
                { type: IssueType.EntityId, identity: '1', message: 'test' },
            ];
            const issue = {
                type: IssueType.EntityId,
                identity: '2',
                message: 'test',
            };
            expect(includesIssue(issues, issue)).toEqual(false);
        });
    });

    describe('isDynamicValue', function () {
        it('should return true when the value contains mustache syntax', function () {
            expect(isDynamicValue('{{hello}}')).toEqual(true);
        });

        it('should return true when the value is a Node-RED environment variable', function () {
            // eslint-disable-next-line no-template-curly-in-string
            expect(isDynamicValue('${env_var}')).toEqual(true);
        });

        it('should return false when the value is neither mustache syntax nor Node-RED environment variable', function () {
            expect(isDynamicValue('hello')).toEqual(false);
        });
    });

    describe('isHomeAssistantNode', function () {
        test.each(Object.values(NodeType))(
            'should return true when a valid Home Assistant node type: %s',
            function (type) {
                const node = { type } as NodeDef;
                expect(isHomeAssistantNode(node)).toEqual(true);
            },
        );

        it('should return false when the node type is not a valid Home Assistant node type', function () {
            const node = { type: 'invalidType' } as NodeDef;
            expect(isHomeAssistantNode(node)).toEqual(false);
        });
    });

    describe('isIssuesEqual', function () {
        it('should return true when the issues are equal', function () {
            const a = [
                { type: IssueType.EntityId, identity: '1', message: 'test' },
            ];
            const b = [
                { type: IssueType.EntityId, identity: '1', message: 'test' },
            ];
            expect(isIssuesEqual(a, b)).toEqual(true);
        });

        describe('Not Equal', function () {
            it('should return false when the identity are not equal', function () {
                const a = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                ];
                const b = [
                    {
                        type: IssueType.EntityId,
                        identity: '2',
                        message: 'test',
                    },
                ];
                expect(isIssuesEqual(a, b)).toEqual(false);
            });

            it('should return false when the message are not equal', function () {
                const a = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                ];
                const b = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test2',
                    },
                ];
                expect(isIssuesEqual(a, b)).toEqual(false);
            });

            it('should return false when the type are not equal', function () {
                const a = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                ];
                const b = [
                    {
                        type: IssueType.DeviceId,
                        identity: '1',
                        message: 'test',
                    },
                ];
                expect(isIssuesEqual(a, b)).toEqual(false);
            });

            it('should return false when the issues length are not equal', function () {
                const a = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                ];
                const b = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                    {
                        type: IssueType.EntityId,
                        identity: '2',
                        message: 'test',
                    },
                ];
                expect(isIssuesEqual(a, b)).toEqual(false);
            });

            it('should return false when Issues are in different order', function () {
                const a = [
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                    {
                        type: IssueType.EntityId,
                        identity: '2',
                        message: 'test',
                    },
                ];
                const b = [
                    {
                        type: IssueType.EntityId,
                        identity: '2',
                        message: 'test',
                    },
                    {
                        type: IssueType.EntityId,
                        identity: '1',
                        message: 'test',
                    },
                ];
                expect(isIssuesEqual(a, b)).toEqual(false);
            });
        });
        it('should return true when both issues are empty', function () {
            expect(isIssuesEqual([], [])).toEqual(true);
        });
    });
});
