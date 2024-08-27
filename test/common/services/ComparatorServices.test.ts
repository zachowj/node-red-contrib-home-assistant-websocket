import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import ComparatorService from '../../../src/common/services/ComparatorService';
import JSONataService from '../../../src/common/services/JSONataService';
import NodeRedContextService from '../../../src/common/services/NodeRedContextService';
import TransformState from '../../../src/common/TransformState';
import HomeAssistant from '../../../src/homeAssistant/HomeAssistant';
import { HassEntity } from '../../../src/types/home-assistant';

describe('Comparator Service', function () {
    let homeAssistantStub: MockProxy<HomeAssistant>;
    let contextServiceStub: MockProxy<NodeRedContextService>;
    let jsonataServiceStub: MockProxy<JSONataService>;
    let comparatorService: ComparatorService;
    let transformState: TransformState;

    beforeAll(function () {
        homeAssistantStub = mock<HomeAssistant>();
        contextServiceStub = mock<NodeRedContextService>();
        jsonataServiceStub = mock<JSONataService>();
        transformState = new TransformState();
    });

    beforeEach(function () {
        mockReset(homeAssistantStub);
        mockReset(contextServiceStub);
        mockReset(jsonataServiceStub);

        comparatorService = new ComparatorService({
            nodeRedContextService: contextServiceStub,
            homeAssistant: homeAssistantStub,
            jsonataService: jsonataServiceStub,
            transformState,
        });
    });

    describe('getComparatorResult', function () {
        describe('checking context values', function () {
            it('should return true when checking message context that exist', async function () {
                contextServiceStub.get.mockReturnValue('bar');
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'payload',
                    'bar',
                    'msg',
                    { message: { payload: 'bar' } },
                );

                expect(contextServiceStub.get).toBeCalledWith(
                    'msg',
                    'payload',
                    {
                        payload: 'bar',
                    },
                );

                expect(result).toBe(true);
            });

            it('should return true when checking flow context that exist', async function () {
                contextServiceStub.get
                    .calledWith('flow', 'foo')
                    .mockReturnValue('bar');

                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'flow',
                );

                expect(result).toBe(true);
            });

            it('should return true when checking global context that exist', async function () {
                contextServiceStub.get
                    .calledWith('global', 'foo')
                    .mockReturnValue('bar');

                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'global',
                );

                expect(result).toBe(true);
            });

            it('should return false when flow context does not exist', async function () {
                const result = await comparatorService.getComparatorResult(
                    'is',
                    'foo',
                    'bar',
                    'flow',
                );

                expect(result).toBe(false);
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

                expect(result).toBe(true);
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

                expect(result).toBe(false);
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

                expect(result).toBe(true);
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

                expect(result).toBe(false);
            });
        });

        describe('check JSONata values', function () {
            afterEach(function () {
                jsonataServiceStub.evaluate.mockReset();
            });

            it('should return true when the JSONata value matches', async function () {
                jsonataServiceStub.evaluate.mockResolvedValue('bar');
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
                expect(jsonataServiceStub.evaluate).toBeCalledWith('foo', {
                    message: { payload: 'bar' },
                    entity,
                    prevEntity: entity,
                });
                expect(result).toBe(true);
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

                    expect(result).toBe(true);
                });

                it('should return false when comparing different values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).toBe(false);
                });

                it('should return true when comparing valid regex values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        '^foo$',
                        'foo',
                        're',
                    );

                    expect(result).toBe(true);
                });

                it('should return false when comparing different regex values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        '^bar$',
                        'foo',
                        're',
                    );

                    expect(result).toBe(false);
                });

                it('should return true when comparing two same booleans', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'true',
                        true,
                        'bool',
                    );

                    expect(result).toBe(true);
                });

                it('should return false when comparing two different booleans', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is',
                        'true',
                        false,
                        'bool',
                    );

                    expect(result).toBe(false);
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

                    expect(result).toBe(false);
                });

                it('should return true when comparing different values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'is_not',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).toBe(true);
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

                    expect(result).toBe(true);
                });

                it('should return false when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gt',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).toBe(false);
                });

                it('should return false when comparing less values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gt',
                        '1',
                        '0',
                        'num',
                    );

                    expect(result).toBe(false);
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

                    expect(result).toBe(true);
                });

                it('should return false when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lt',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).toBe(false);
                });

                it('should return false when comparing greater values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lt',
                        '1',
                        '2',
                        'num',
                    );

                    expect(result).toBe(false);
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

                    expect(result).toBe(true);
                });

                it('should return true when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gte',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).toBe(true);
                });

                it('should return false when comparing less values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'gte',
                        '1',
                        '0',
                        'num',
                    );

                    expect(result).toBe(false);
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

                    expect(result).toBe(true);
                });

                it('should return true when comparing equal values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lte',
                        '1',
                        '1',
                        'num',
                    );

                    expect(result).toBe(true);
                });

                it('should return false when comparing greater values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'lte',
                        '1',
                        '2',
                        'num',
                    );

                    expect(result).toBe(false);
                });
            });

            describe('is in', function () {
                it('should convert the compare data type to "list"', async function () {
                    vi.spyOn(transformState, 'transform');
                    await comparatorService.getComparatorResult(
                        'includes',
                        'foo, bar',
                        'bar',
                        'str',
                    );

                    expect(transformState.transform).toBeCalledWith(
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

                    expect(result).toBe(true);
                });

                it('should return false when comparing not in values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'includes',
                        'bar, baz',
                        'foo',
                        'str',
                    );

                    expect(result).toBe(false);
                });

                it('should return false when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'includes',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).toBe(false);
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

                    expect(result).toBe(false);
                });

                it('should return true when comparing not in values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'does_not_include',
                        'bar, baz',
                        'foo',
                        'str',
                    );

                    expect(result).toBe(true);
                });

                it('should return true when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'does_not_include',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).toBe(true);
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

                    expect(result).toBe(true);
                });

                it('should return false when comparing not starts with values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'starts_with',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).toBe(false);
                });

                it('should return false when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'starts_with',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).toBe(false);
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

                    expect(result).toBe(true);
                });

                it('should return false when comparing not contains values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'cont',
                        'foo',
                        'bar',
                        'str',
                    );

                    expect(result).toBe(false);
                });

                it('should return false when comparing empty values', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'cont',
                        '',
                        'foo',
                        'str',
                    );

                    expect(result).toBe(false);
                });
            });

            describe('is in a Home Assistant group', function () {
                it.skip('should return true when entity id is in group');
                it.skip('should return false when entity id is not in group');
            });

            describe('JSONata', function () {
                afterEach(function () {
                    jsonataServiceStub.evaluate.mockReset();
                });

                it('should return true when input is empty', async function () {
                    const result = await comparatorService.getComparatorResult(
                        'jsonata',
                        '',
                        '',
                        'jsonata',
                    );

                    expect(result).toBe(true);
                });

                it('should return true when the JSONata services returns true', async function () {
                    jsonataServiceStub.evaluate.mockResolvedValue(true);
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
                    expect(jsonataServiceStub.evaluate).toBeCalledWith('foo', {
                        message: { payload: 'bar' },
                        entity,
                        prevEntity: entity,
                    });
                    expect(result).toBe(true);
                });

                it('should return false when the JSONata services returns false', async function () {
                    jsonataServiceStub.evaluate.mockResolvedValue(false);
                    const result = await comparatorService.getComparatorResult(
                        'jsonata',
                        'foo',
                        'bar',
                        'jsonata',
                    );
                    expect(result).toBe(false);
                });
            });
        });
    });
});
