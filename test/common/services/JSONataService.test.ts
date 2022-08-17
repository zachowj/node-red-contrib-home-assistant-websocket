import chai, { expect } from 'chai';
import jsonata, { Expression } from 'jsonata';
import { Node, NodeAPI, NodeMessage } from 'node-red';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import JSONataService from '../../../src/common/services/JSONataService';
import { setRED } from '../../../src/globals';
import HomeAssistant from '../../../src/homeAssistant/HomeAssistant';
import { resetStubInterface } from '../../helpers';

chai.use(sinonChai);

describe('JSONata Service', function () {
    let NodeApiStub: StubbedInstance<NodeAPI>;
    let homeAssistantStub: StubbedInstance<HomeAssistant>;
    let nodeStub: StubbedInstance<Node>;

    before(function () {
        NodeApiStub = stubInterface<NodeAPI>();
        setRED(NodeApiStub);
    });

    beforeEach(function () {
        let expression: Expression;
        homeAssistantStub = stubInterface<HomeAssistant>();
        nodeStub = stubInterface<Node>();

        const prepareJSONataExpressionFake = (value: string) => {
            expression = jsonata(value);
            return expression;
        };
        const evaluateJSONataExpressionFake = (
            expr: Expression,
            msg: NodeMessage
        ) => expr.evaluate(msg);

        NodeApiStub.util.prepareJSONataExpression = sinon
            .stub()
            .callsFake(prepareJSONataExpressionFake);
        NodeApiStub.util.evaluateJSONataExpression = sinon
            .stub()
            .callsFake(evaluateJSONataExpressionFake);
    });

    afterEach(function () {
        sinon.restore();
        resetStubInterface(homeAssistantStub);
        resetStubInterface(nodeStub);
    });

    describe('evaluate', function () {
        const jsonataService = new JSONataService({
            node: nodeStub,
            homeAssistant: homeAssistantStub,
        });
        it('should call setup functions', function () {
            const result = jsonataService.evaluate(`"test"`);

            expect(NodeApiStub.util.prepareJSONataExpression).to.have.been
                .calledOnce;
            expect(NodeApiStub.util.evaluateJSONataExpression).to.have.been
                .calledOnce;
            expect(result).to.equal('test');
        });

        it('should return the correct value from an equation', function () {
            const result = jsonataService.evaluate(`1 + 1`);

            expect(result).to.equal(2);
        });

        describe('should use the message object as the context', function () {
            it('should be able to do math', function () {
                const result = jsonataService.evaluate(`1 + payload`, {
                    message: { payload: 1 },
                });

                expect(result).to.equal(2);
            });

            it('should return message payload of type string', function () {
                const result = jsonataService.evaluate(`payload`, {
                    message: { payload: 'hello' },
                });

                expect(result).to.equal('hello');
            });
        });

        describe('$entity()', function () {
            it('should output whole entity', function () {
                const result = jsonataService.evaluate(`$entity()`, {
                    entity: {
                        entity_id: 'light.kitchen',
                        state: 'on',
                        attributes: {},
                    },
                });

                expect(result).to.deep.equal({
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                });
            });
            it('should be able to output state', function () {
                const result = jsonataService.evaluate(`$entity().state`, {
                    entity: { entiy_id: 'light.kitchen', state: 'on' },
                });

                expect(result).to.equal('on');
            });

            it('should be compare state', function () {
                const result = jsonataService.evaluate(
                    `$entity().state = "on"`,
                    {
                        entity: { entiy_id: 'light.kitchen', state: 'on' },
                    }
                );

                expect(result).to.equal(true);
            });
        });

        describe('$prevEntity()', function () {
            it('should output whole prevEntity', function () {
                const result = jsonataService.evaluate(`$prevEntity()`, {
                    prevEntity: {
                        entity_id: 'light.kitchen',
                        state: 'on',
                        attributes: {},
                    },
                });

                expect(result).to.deep.equal({
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                });
            });
            it('should be able to output state', function () {
                const result = jsonataService.evaluate(`$prevEntity().state`, {
                    prevEntity: { entiy_id: 'light.kitchen', state: 'on' },
                });

                expect(result).to.equal('on');
            });

            it('should be compare state of prevEntity', function () {
                const result = jsonataService.evaluate(
                    `$prevEntity().state = "on"`,
                    {
                        prevEntity: { entiy_id: 'light.kitchen', state: 'on' },
                    }
                );

                expect(result).to.equal(true);
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
            };
            it('should return all entities');
            it('should return a single entity when passed an entitiy id');
            // it('should return all entities', function () {
            //     websocketStub.getStates.returns(entities);
            //     homeAssistantStub.websocket = websocketStub;
            //     const result = jsonataService.evaluate(`$entities()`);
            //     console.log(homeAssistantStub.websocket.getStates());
            //     expect(result).to.deep.equal(entities);
            // });

            // it('should return a single entity when passed an entitiy id', function () {
            //     websocketStub.getStates.returns(entities);
            //     const result = jsonataService.evaluate(
            //         `$entities("light.kitchen")`
            //     );

            //     expect(result).to.deep.equal(entities['light.kitchen']);
            // });
        });

        describe('lodash functions', function () {
            describe('randomNumber()', function () {
                it('should be able to call randomNumber', function () {
                    const result =
                        jsonataService.evaluate(`$randomNumber(5, 10)`);

                    expect(result).to.be.a('number');
                    expect(result).to.be.within(5, 10);
                });
            });

            describe('sampleSize', function () {
                it('should get a single results 1-3', function () {
                    const result =
                        jsonataService.evaluate(`$sampleSize([1,2,3])`);

                    expect(result).to.be.a('array');
                    expect(result).to.have.lengthOf(1);
                    expect(result[0]).to.be.a('number');
                    expect(result[0]).to.be.within(1, 3);
                });
                it('should get two results 5-7', function () {
                    const result = jsonataService.evaluate(
                        `$sampleSize([5,6,7], 2)`
                    );

                    expect(result).to.be.a('array');
                    expect(result).to.have.lengthOf(2);
                    expect(result[0]).to.be.a('number');
                    expect(result[0]).to.be.within(5, 7);
                    expect(result[1]).to.be.a('number');
                    expect(result[1]).to.be.within(5, 7);
                });
            });
        });

        describe('$outputData', function () {
            it('should return all output data', function () {
                const outputData = {
                    one: { abc: 123 },
                    two: false,
                };
                const result = jsonataService.evaluate(
                    `$outputData()`,
                    outputData
                );

                expect(result).to.deep.equal(outputData);
            });

            it('should return all output data except the message property', function () {
                const expectedResults = {
                    one: { abc: 123 },
                    two: false,
                };
                const outputData = {
                    ...expectedResults,
                    message: { payload: 'hello' },
                };
                const result = jsonataService.evaluate(
                    `$outputData()`,
                    outputData
                );

                expect(result).to.deep.equal(expectedResults);
            });

            it('should return a single output data', function () {
                const outputData = {
                    one: { abc: 123 },
                    two: false,
                };
                const result = jsonataService.evaluate(
                    `$outputData().one`,
                    outputData
                );

                expect(result).to.deep.equal(outputData.one);
            });
        });
    });
});
