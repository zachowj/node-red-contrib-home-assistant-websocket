import jsonata, { Expression } from 'jsonata';
import { NodeAPI, NodeContext } from 'node-red';
import { describe, expect, it, vi } from 'vitest';
import { mock, mockDeep } from 'vitest-mock-extended';

import { NodeEvent } from '../../../../src/common/events/Events';
import InputService, {
    DataSource,
} from '../../../../src/common/services/InputService';
import JSONataService from '../../../../src/common/services/JSONataService';
import NodeRedContextService, {
    ContextLocation,
} from '../../../../src/common/services/NodeRedContextService';
import TypedInputService from '../../../../src/common/services/TypedInputService';
import Status from '../../../../src/common/status/Status';
import { TypedInputTypes } from '../../../../src/const';
import { setRED } from '../../../../src/globals';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import Websocket from '../../../../src/homeAssistant/Websocket';
import { ActionNode, ActionNodeProperties } from '../../../../src/nodes/action';
import ActionController from '../../../../src/nodes/action/ActionController';
import { Queue } from '../../../../src/nodes/action/const';
import { NodeDone, NodeMessage, NodeSend } from '../../../../src/types/nodes';

describe('ActionController output properties', () => {
    const context = {
        id: '01M1F5Y2WKP5M0ADT1G2HV96CN',
        parent_id: null,
        user_id: 'ed5337e91ce5441a93f54814a2516816',
    };

    const cases: {
        name: string;
        response: { context?: typeof context; response?: { value: number } };
        results: { value: number } | undefined;
    }[] = [
        { name: 'context only', response: { context }, results: undefined },
        {
            name: 'context and service response data',
            response: { context, response: { value: 42 } },
            results: { value: 42 },
        },
        { name: 'empty response', response: {}, results: undefined },
    ];

    it.each(cases)(
        'exposes context without changing results for $name',
        async ({ response, results }) => {
            const nodeApi = mockDeep<NodeAPI>();
            nodeApi.util.prepareJSONataExpression.mockImplementation(
                (value) =>
                    jsonata(value) as ReturnType<
                        NodeAPI['util']['prepareJSONataExpression']
                    >,
            );
            nodeApi.util.evaluateJSONataExpression.mockImplementation(
                (expression, message, callback) => {
                    (expression as unknown as Expression)
                        .evaluate(message)
                        .then(
                            (value) => callback(null, value),
                            (error) => callback(error, undefined),
                        );
                },
            );
            setRED(nodeApi);

            const node = mock<ActionNode>();
            const on = vi.fn().mockReturnValue(node);
            Object.assign(node, { on });
            node.config = {
                id: 'action',
                name: 'Toggle switch',
                z: 'flow',
                type: 'api-call-service',
                version: 7,
                action: 'switch.toggle',
                data: '',
                dataType: TypedInputTypes.JSON,
                mergeContext: '',
                mustacheAltTags: false,
                queue: Queue.None,
                blockInputOverrides: true,
                outputProperties: [
                    ...[
                        'context',
                        'context.id',
                        'context.parent_id',
                        'context.user_id',
                    ].map((property) => ({
                        property: property.replace('.', '_'),
                        propertyType: ContextLocation.Msg,
                        value: `$outputData("context")${property.slice('context'.length)}`,
                        valueType: TypedInputTypes.JSONata,
                    })),
                    {
                        property: 'results',
                        propertyType: ContextLocation.Msg,
                        value: '',
                        valueType: TypedInputTypes.Results,
                    },
                ],
            };
            node.context.mockReturnValue(mockDeep<NodeContext>());

            const homeAssistant = mockDeep<HomeAssistant>({
                isConnected: true,
                websocket: mockDeep<Websocket>({ isConnected: true }),
            });
            homeAssistant.websocket.getStates.mockReturnValue({});
            homeAssistant.websocket.callService.mockResolvedValue(response);

            const inputService = mock<InputService<ActionNodeProperties>>();
            inputService.parse.mockReturnValue({
                action: {
                    key: 'action',
                    value: 'switch.toggle',
                    source: DataSource.Config,
                },
                target: {
                    key: 'target',
                    value: {},
                    source: DataSource.Message,
                },
            });
            const contextService = mock<NodeRedContextService>();
            contextService.set.mockImplementation(
                (value, _location, property, message) => {
                    if (message) (message as NodeMessage)[property] = value;
                },
            );
            const jsonataService = new JSONataService({ node });
            const typedInputService = new TypedInputService({
                nodeConfig: node.config,
                context: contextService,
                jsonata: jsonataService,
            });
            node.controller = new ActionController({
                node,
                homeAssistant,
                inputService,
                jsonataService,
                nodeRedContextService: contextService,
                typedInputService,
                status: mock<Status>(),
            });

            const handleInput = on.mock.calls.find(
                ([event]) => event === NodeEvent.Input,
            )?.[1] as (
                message: NodeMessage,
                send: NodeSend,
                done: NodeDone,
            ) => Promise<void>;
            const message: NodeMessage = { payload: {} };
            const send = vi.fn();
            const done = vi.fn();
            await handleInput(message, send, done);

            expect(homeAssistant.websocket.callService).toHaveBeenCalledWith(
                'switch',
                'toggle',
                undefined,
                {},
            );
            expect(message.context).toEqual(response.context);
            expect(message.context_id).toEqual(response.context?.id);
            expect(message.context_parent_id).toEqual(
                response.context?.parent_id,
            );
            expect(message.context_user_id).toEqual(response.context?.user_id);
            expect(message.results).toEqual(results);
            expect(send).toHaveBeenCalledWith(message);
            expect(done).toHaveBeenCalledWith();
        },
    );
});
