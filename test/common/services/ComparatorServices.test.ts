import chai, { expect } from 'chai';
import { afterEach } from 'mocha';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import ComparatorService from '../../../src/common/services/ComparatorService';
import JSONataService from '../../../src/common/services/JSONataService';
import NodeRedContextService from '../../../src/common/services/NodeRedContextService';
import TransformState from '../../../src/common/TransformState';
import HomeAssistant from '../../../src/homeAssistant/HomeAssistant';
import { HassEntity } from '../../../src/types/home-assistant';

chai.use(sinonChai);

describe('Comparator Service', function () {
    let homeAssistantStub: StubbedInstance<HomeAssistant>;
    let contextServiceStub: StubbedInstance<NodeRedContextService>;
    let jsonataServiceStub: StubbedInstance<JSONataService>;
    let comparatorService: ComparatorService;
    let transformState: TransformState;

    before(function () {
        homeAssistantStub = stubInterface<HomeAssistant>();
        contextServiceStub = stubInterface<NodeRedContextService>();
        jsonataServiceStub = stubInterface<JSONataService>();
        transformState = new TransformState();
    });

    beforeEach(function () {
        comparatorService = new ComparatorService({
            nodeRedContextService: contextServiceStub,
            homeAssistant: homeAssistantStub,
            jsonataService: jsonataServiceStub,
            transformState,
        });
    });

    afterEach(function () {
        sinon.reset();
    });

    describe('getComparatorResult', function () {
        describe('checking context values', function () {
            it('should return true when checking message context that exist', async function () {
                contextServiceStub.get
                    .withArgs('msg', 'foo', { payload: 'bar' })
                    .returns('bar');
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'msg',
                    { message: { payload: 'bar' } },
                );

                expect(contextServiceStub.get).to.have.been.calledWith(
                    'msg',
                    'foo',
                    { payload: 'bar' },
                );
                expect(result).to.be.true;
            });

            it('should return true when checking flow context that exist', async function () {
                contextServiceStub.get.withArgs('flow', 'foo').returns('bar');

                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'flow',
                );

                expect(result).to.be.true;
            });
            it('should return true when checking global context that exist', async function () {
                contextServiceStub.get.withArgs('global', 'foo').returns('bar');

                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'global',
                );

                expect(result).to.be.true;
            });
            it('should return false when flow context does not exist', async function () {
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'flow',
                );

                expect(result).to.be.false;
            });
        });
        describe('check entity values', function () {
            it('should return true when entitys state is equal to expected state', async function () {
                const entity = {
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                };
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'state',
                    entity.state,
                    'entity',
                    { entity: entity as HassEntity },
                );

                expect(result).to.be.true;
            });
            it('should return false when entitys state is not equal to expected state', async function () {
                const entity = {
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                };
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'state',
                    'off',
                    'entity',
                    { entity: entity as HassEntity },
                );

                expect(result).to.be.false;
            });
        });

        describe('check previous entity values', function () {
            it('should return true when entitys state is equal to expected state', async function () {
                const entity = {
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                };
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'state',
                    entity.state,
                    'prevEntity',
                    { prevEntity: entity as HassEntity },
                );

                expect(result).to.be.true;
            });
            it('should return false when entitys state is not equal to expected state', async function () {
                const entity = {
                    entity_id: 'light.kitchen',
                    state: 'on',
                    attributes: {},
                };
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'state',
                    'off',
                    'prevEntity',
                    { prevEntity: entity as HassEntity },
                );

                expect(result).to.be.false;
            });
        });

        describe('check JSONata values', function () {
            afterEach(function () {
                jsonataServiceStub.evaluate.reset();
            });

            it('should return true when the JSONata value matches', async function () {
                jsonataServiceStub.evaluate.resolves('bar');
                const entity = {
                    entity_id: 'light.light',
                } as HassEntity;

                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'jsonata',
                    {
                        message: {
                            payload: 'bar',
                        },
                        entity,
                        prevEntity: entity,
                    },
                );
                expect(jsonataServiceStub.evaluate).to.have.been.calledWith(
                    'foo',
                    {
                        message: { payload: 'bar' },
                        entity,
                        prevEntity: entity,
                    },
                );
                expect(result).to.be.true;
            });
        });

        describe('comparator types', function () {
            describe('is', function () {
                it('should return true when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'foo',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing different values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).to.be.false;
                });
                it('should return true when comparing valid regex values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        '^foo$',
                        'foo',
                        're',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing different regex values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        '^bar$',
                        'foo',
                        're',
                    );

                    expect(result).to.be.false;
                });
                it('should return true when comparing two same booleans', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'true',
                        true,
                        'bool',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing two different booleans', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'true',
                        false,
                        'bool',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('is not', function () {
                it('should return false when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is_not',
                        'foo',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.false;
                });
                it('should return true when comparing different values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is_not',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).to.be.true;
                });
            });
            describe('is greater than', function () {
                it('should return true when comparing greater values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gt',
                        '1',
                        '2',
                        'num',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gt',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).to.be.false;
                });
                it('should return false when comparing less values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gt',
                        '1',
                        '0',
                        'num',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('is less than', function () {
                it('should return true when comparing less values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lt',
                        '1',
                        '0',
                        'num',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lt',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).to.be.false;
                });
                it('should return false when comparing greater values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lt',
                        '1',
                        '2',
                        'num',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('is greater than or equal to', function () {
                it('should return true when comparing greater values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gte',
                        '1',
                        '2',
                        'num',
                    );

                    expect(result).to.be.true;
                });
                it('should return true when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gte',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing less values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gte',
                        '1',
                        '0',
                        'num',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('is less than or equal to', function () {
                it('should return true when comparing less values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lte',
                        '1',
                        '0',
                        'num',
                    );

                    expect(result).to.be.true;
                });
                it('should return true when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lte',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing greater values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lte',
                        '1',
                        '2',
                        'num',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('is in', function () {
                it('should convert the compare data type to "list"', async function () {
                    sinon.spy(transformState, 'transform');
                    await comparatorService.getComparatorResult(
                        'includes',
                        'foo, bar',
                        'bar',
                        'str',
                    );

                    expect(transformState.transform).to.have.been.calledWith(
                        'list',
                        'foo, bar',
                    );
                });

                it('should return true when comparing in values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'includes',
                        'foo, bar',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing not in values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'includes',
                        'bar, baz',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.false;
                });
                it('should return false when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'includes',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('is not in', function () {
                it('should return false when comparing in values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'does_not_include',
                        'foo, bar',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.false;
                });
                it('should return true when comparing not in values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'does_not_include',
                        'bar, baz',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.true;
                });
                it('should return true when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'does_not_include',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.true;
                });
            });
            describe('starts with', function () {
                it('should return true when comparing starts with values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'starts_with',
                        'foo',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing not starts with values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'starts_with',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).to.be.false;
                });
                it('should return false when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'starts_with',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.false;
                });
            });
            describe('contains', function () {
                it('should return true when comparing contains values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'cont',
                        'foo',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.true;
                });
                it('should return false when comparing not contains values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'cont',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).to.be.false;
                });
                it('should return false when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'cont',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).to.be.false;
                });
            });

            // describe('is in a Home Assistnat group', function () {
            //     it('should return true when entity id is in group');
            //     it('should return false when entity id is not in group');
            // });

            describe('JSONata', function () {
                afterEach(function () {
                    jsonataServiceStub.evaluate.reset();
                });

                it('should return true when input is empty', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'jsonata',
                        '',
                        '',
                        'jsonata',
                    );

                    expect(result).to.be.true;
                });

                it('should return true when the JSONata services returns true', async function () {
                    jsonataServiceStub.evaluate.resolves(true);
                    const entity = {
                        entity_id: 'light.light',
                    } as HassEntity;

                    const result = await comparatorService.getComparatorResult(
                        'jsonata',
                        'foo',
                        'bar',
                        'jsonata',
                        {
                            message: {
                                payload: 'bar',
                            },
                            entity,
                            prevEntity: entity,
                        },
                    );
                    expect(jsonataServiceStub.evaluate).to.have.been.calledWith(
                        'foo',
                        {
                            message: { payload: 'bar' },
                            entity,
                            prevEntity: entity,
                        },
                    );
                    expect(result).to.be.true;
                });
                it('should return false when the JSONata services returns false', async function () {
                    jsonataServiceStub.evaluate.resolves(false);
                    const result = await comparatorService.getComparatorResult(
                        'jsonata',
                        'foo',
                        'bar',
                        'jsonata',
                    );
                    expect(result).to.be.false;
                });
            });
        });
    });
});
