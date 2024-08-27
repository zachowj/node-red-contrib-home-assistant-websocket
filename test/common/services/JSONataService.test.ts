import { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import jsonata, { Expression } from 'jsonata';
import { Node, NodeAPI, NodeMessage } from 'node-red';
import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import {
    DeepMockProxy,
    mock,
    mockDeep,
    MockProxy,
    mockReset,
} from 'vitest-mock-extended';

import JSONataService from '../../../src/common/services/JSONataService';
import { setRED } from '../../../src/globals';
import HomeAssistant from '../../../src/homeAssistant/HomeAssistant';

describe('JSONata Service', function () {
    let NodeApiStub: MockProxy<NodeAPI>;
    let homeAssistantStub: DeepMockProxy<HomeAssistant>;
    let nodeStub: MockProxy<Node>;

    beforeAll(function () {
        NodeApiStub = mock<NodeAPI>();
        setRED(NodeApiStub);
    });

    beforeEach(function () {
        let expression: Expression;
        homeAssistantStub = mockDeep<HomeAssistant>();
        nodeStub = mock<Node>();

        const prepareJSONataExpressionFake = (value: string) => {
            expression = jsonata(value);
            return expression;
        };
        const evaluateJSONataExpressionFake = (
            expr: Expression,
            msg: NodeMessage,
            callback: (err: Error | null, result: any) => void,
        ) => callback(null, expr.evaluate(msg));

        NodeApiStub.util.prepareJSONataExpression = vi
            .fn()
            .mockImplementation(prepareJSONataExpressionFake);
        NodeApiStub.util.evaluateJSONataExpression = vi
            .fn()
            .mockImplementation(evaluateJSONataExpressionFake);
    });

    afterEach(function () {
        mockReset(NodeApiStub);
        mockReset(homeAssistantStub);
    });

    describe('evaluate', function () {
        const jsonataService = new JSONataService({
            node: nodeStub,
            homeAssistant: homeAssistantStub,
        });

        it('should call setup functions', async function () {
            const result = await jsonataService.evaluate(`"test"`);
            expect(
                NodeApiStub.util.prepareJSONataExpression,
            ).toHaveBeenCalledOnce();
            expect(
                NodeApiStub.util.evaluateJSONataExpression,
            ).toHaveBeenCalledOnce();
            expect(result).toEqual('test');
        });

        it('should return the correct value from an equation', async function () {
            const result = await jsonataService.evaluate(`1 + 1`);

            expect(result).toEqual(2);
        });

        describe('should use the message object as the context', function () {
            it('should be able to do math', async function () {
                const result = await jsonataService.evaluate(`1 + payload`, {
                    message: { payload: 1 },
                });

                expect(result).toEqual(2);
            });

            it('should return message payload of type string', async function () {
                const result = await jsonataService.evaluate(`payload`, {
                    message: { payload: 'hello' },
                });

                expect(result).toEqual('hello');
            });
        });

        describe('$entity()', function () {
            it('should output whole entity', async function () {
                const result = await jsonataService.evaluate(`$entity()`, {
                    entity: {
                        entity_id: 'light.kitchen',
                        state: 'on',
                        attributes: {},
                    },
                });

                expect(result).toEqual({
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                });
            });

            it('should be able to output state', async function () {
                const result = await jsonataService.evaluate(
                    `$entity().state`,
                    {
                        entity: { entiy_id: 'light.kitchen', state: 'on' },
                    },
                );

                expect(result).toEqual('on');
            });

            it('should be compare state', async function () {
                const result = await jsonataService.evaluate(
                    `$entity().state = "on"`,
                    {
                        entity: { entiy_id: 'light.kitchen', state: 'on' },
                    },
                );

                expect(result).toEqual(true);
            });
        });

        describe('$prevEntity()', function () {
            it('should output whole prevEntity', async function () {
                const result = await jsonataService.evaluate(`$prevEntity()`, {
                    prevEntity: {
                        entity_id: 'light.kitchen',
                        state: 'on',
                        attributes: {},
                    },
                });

                expect(result).toEqual({
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                });
            });

            it('should be able to output state', async function () {
                const result = await jsonataService.evaluate(
                    `$prevEntity().state`,
                    {
                        prevEntity: { entiy_id: 'light.kitchen', state: 'on' },
                    },
                );

                expect(result).toEqual('on');
            });

            it('should be compare state of prevEntity', async function () {
                const result = await jsonataService.evaluate(
                    `$prevEntity().state = "on"`,
                    {
                        prevEntity: { entiy_id: 'light.kitchen', state: 'on' },
                    },
                );

                expect(result).toEqual(true);
            });
        });

        describe('$entities()', function () {
            const entities = {
                'light.kitchen': {
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                    last_changed: '2019-01-01T00:00:00.000000Z',
                    last_updated: '2019-01-01T00:00:00.000000Z',
                    context: {
                        id: 'c0b8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8',
                        user_id: 'user_id',
                        parent_id: '0000',
                    },
                },
                'light.living_room': {
                    entity_id: 'light.living_room',
                    state: 'on',
                    attributes: {},
                    last_changed: '2019-01-01T00:00:00.000000Z',
                    last_updated: '2019-01-01T00:00:00.000000Z',
                    context: {
                        id: 'c0b8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8',
                        user_id: 'user_id',
                        parent_id: '0000',
                    },
                },
            } as HassEntities;

            it.skip('should return all entities', async function () {
                vi.spyOn(
                    homeAssistantStub.websocket,
                    'getStates',
                ).mockReturnValue(entities as unknown as HassEntity);
                const result = await jsonataService.evaluate(`$entities()`);
                expect(result).toEqual(entities);
            });

            it.skip('should return a single entity when passed an entitiy id', async function () {
                homeAssistantStub.websocket.getStates
                    .calledWith('light.kitchen')
                    .mockReturnValue(entities['light.kitchen']);
                const result = await jsonataService.evaluate(
                    `$entities("light.kitchen")`,
                );
                expect(result).toEqual(entities['light.kitchen']);
            });
        });

        describe('lodash functions', function () {
            describe('randomNumber()', function () {
                it('should be able to call randomNumber', async function () {
                    const result =
                        await jsonataService.evaluate(`$randomNumber(5, 10)`);
                    expect(result).toBeTypeOf('number');
                    expect(result).toBeGreaterThanOrEqual(5);
                    expect(result).toBeLessThanOrEqual(10);
                });
            });

            describe('sampleSize', function () {
                it('should get a single results 1-3', async function () {
                    const result =
                        await jsonataService.evaluate(`$sampleSize([1,2,3])`);

                    expect(Array.isArray(result)).toBe(true);
                    expect(result).toHaveLength(1);
                    expect(result[0]).toBeTypeOf('number');
                    expect(result[0]).toBeGreaterThanOrEqual(0);
                    expect(result[0]).toBeLessThanOrEqual(3);
                });

                it('should get two results 5-7', async function () {
                    const result = await jsonataService.evaluate(
                        `$sampleSize([5,6,7], 2)`,
                    );

                    expect(Array.isArray(result)).toBe(true);
                    expect(result).toHaveLength(2);
                    expect(result[0]).toBeTypeOf('number');
                    expect(result[0]).toBeGreaterThanOrEqual(5);
                    expect(result[0]).toBeLessThanOrEqual(7);
                    expect(result[1]).toBeGreaterThanOrEqual(5);
                    expect(result[1]).toBeLessThanOrEqual(7);
                    expect(result[1]).toBeTypeOf('number');
                });
            });
        });

        describe('$outputData', function () {
            it('should return all output data', async function () {
                const outputData = {
                    one: { abc: 123 },
                    two: false,
                };
                const result = await jsonataService.evaluate(
                    `$outputData()`,
                    outputData,
                );

                expect(result).toEqual(outputData);
            });

            it('should return all output data except the message property', async function () {
                const expectedResults = {
                    one: { abc: 123 },
                    two: false,
                };
                const outputData = {
                    ...expectedResults,
                    message: { payload: 'hello' },
                };
                const result = await jsonataService.evaluate(
                    `$outputData()`,
                    outputData,
                );

                expect(result).toEqual(expectedResults);
            });

            it('should return a single output data', async function () {
                const outputData = {
                    one: { abc: 123 },
                    two: false,
                };
                const result = await jsonataService.evaluate(
                    `$outputData().one`,
                    outputData,
                );

                expect(result).toEqual(outputData.one);
            });
        });
    });
});
