import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import JSONataService from '../../../../src/common/services/JSONataService';
import NodeRedContextService from '../../../../src/common/services/NodeRedContextService';
import TypedInputService from '../../../../src/common/services/TypedInputService';
import { TypedInputTypes } from '../../../../src/const';

const nodeConfig = {
    id: 'test',
    type: 'ha-test',
    name: 'test node',
};

describe('Typed Input Service', function () {
    let contextServiceStub: MockProxy<NodeRedContextService>;
    let jsonataServiceStub: MockProxy<JSONataService>;
    let typedInputService: TypedInputService;

    beforeAll(function () {
        contextServiceStub = mock<NodeRedContextService>();
        jsonataServiceStub = mock<JSONataService>();
        typedInputService = new TypedInputService({
            nodeConfig,
            context: contextServiceStub,
            jsonata: jsonataServiceStub,
        });
    });

    afterEach(function () {
        mockReset(contextServiceStub);
        mockReset(jsonataServiceStub);
    });

    describe('getValue', function () {
        it('should return the value of the msg property', async function () {
            const message = { payload: 'bar' };
            contextServiceStub.get
                .calledWith('msg', 'payload', message)
                .mockReturnValue('bar');
            const results = await typedInputService.getValue(
                'payload',
                TypedInputTypes.Message,
                {
                    message,
                },
            );

            expect(contextServiceStub.get).toHaveBeenCalledWith(
                'msg',
                'payload',
                message,
            );
            expect(results).toEqual('bar');
        });

        it('should return the value of the flow property', async function () {
            contextServiceStub.get
                .calledWith('flow', 'payload')
                .mockReturnValue('bar');
            const results = await typedInputService.getValue(
                'payload',
                TypedInputTypes.Flow,
            );

            expect(results).toEqual('bar');
        });

        it('should return the value of the global property', async function () {
            contextServiceStub.get
                .calledWith('global', 'payload')
                .mockReturnValue('bar');
            const results = await typedInputService.getValue(
                'payload',
                TypedInputTypes.Global,
            );

            expect(results).toEqual('bar');
        });

        describe('bool', function () {
            it('should return true when type is set to bool and value "true"', async function () {
                const results = await typedInputService.getValue(
                    'true',
                    TypedInputTypes.Boolean,
                );
                expect(results).toEqual(true);
            });

            it('should return false when type is set to bool and value "false"', async function () {
                const results = await typedInputService.getValue(
                    'false',
                    TypedInputTypes.Boolean,
                );
                expect(results).toEqual(false);
            });

            it('should return false when type is set to bool and value is not "true"', async function () {
                const results = await typedInputService.getValue(
                    'foo',
                    TypedInputTypes.Boolean,
                );
                expect(results).toEqual(false);
            });
        });

        describe('json', function () {
            it('should return the value of the json property', async function () {
                const results = await typedInputService.getValue(
                    '{"foo": "bar"}',
                    TypedInputTypes.JSON,
                );
                expect(results).toEqual({ foo: 'bar' });
            });

            it('should catch errors silently when parsing the json', async function () {
                const results = await typedInputService.getValue(
                    '{"foo": "bar"',
                    TypedInputTypes.JSON,
                );
                expect(results).toEqual(undefined);
            });
        });

        it('should return the current timestamp', async function () {
            vi.useFakeTimers();
            const now = new Date();
            vi.setSystemTime(now);
            const results = await typedInputService.getValue(
                '',
                TypedInputTypes.Date,
            );
            expect(results).toEqual(now.getTime());
            vi.useRealTimers();
        });

        it('should return a number', async function () {
            const results = await typedInputService.getValue(
                '1',
                TypedInputTypes.Number,
            );
            expect(results).toEqual(1);
        });

        it('should return undefined when type set to "none"', async function () {
            const results = await typedInputService.getValue(
                '',
                TypedInputTypes.None,
            );
            expect(results).toEqual(undefined);
        });

        it('should retun a string', async function () {
            const results = await typedInputService.getValue(
                'foo',
                TypedInputTypes.String,
            );
            expect(results).toEqual('foo');
        });

        describe('JSONata', function () {
            it('should return undefined when value is empty', async function () {
                const results = await typedInputService.getValue(
                    '',
                    TypedInputTypes.JSONata,
                );
                expect(results).toEqual(undefined);
            });

            it('should pass the correct properties to the JSONata service', async function () {
                const objs = {
                    data: { foo: 'bar2' },
                    entity: { foo: 'bar' },
                    entityId: 'light.light',
                    eventData: { foo: 'bar3' },
                    message: { payload: 'bar' },
                    prevEntity: { foo: 'bar4' },
                    results: 'hello',
                };
                jsonataServiceStub.evaluate
                    .calledWith('foo')
                    .mockResolvedValue('bar');
                const results = await typedInputService.getValue(
                    'foo',
                    TypedInputTypes.JSONata,
                    objs,
                );

                expect(jsonataServiceStub.evaluate).toHaveBeenCalledWith(
                    'foo',
                    objs,
                );
                expect(results).toEqual('bar');
            });
        });

        describe('config', function () {
            it('should return the id value of the config', async function () {
                const results = await typedInputService.getValue(
                    'id',
                    TypedInputTypes.Config,
                );
                expect(results).toEqual('test');
            });

            it('should return the name value of the config', async function () {
                const results = await typedInputService.getValue(
                    'name',
                    TypedInputTypes.Config,
                );
                expect(results).toEqual('test node');
            });

            it('should return the complete config when value is empty', async function () {
                const results = await typedInputService.getValue(
                    '',
                    TypedInputTypes.Config,
                );
                expect(results).toEqual({
                    id: 'test',
                    type: 'ha-test',
                    name: 'test node',
                });
            });
        });

        describe('custom ouput properties', function () {
            const props: Partial<Record<TypedInputTypes, any>> = {
                data: 'data_value',
                entity: 'entity_value',
                entityState: 'entityState_value',
                eventData: 'eventData_value',
                headers: 'headers_value',
                params: 'params_value',
                triggerId: 'triggerId_value',
                prevEntity: 'prevEntity_value',
                results: 'results_value',
            };

            it('should return the prop value for a given prop', async function () {
                const properties = Object.keys(props) as TypedInputTypes[];
                for (const prop of properties) {
                    const results = await typedInputService.getValue(
                        '',
                        prop,
                        props,
                    );
                    expect(results).toEqual(prop + '_value');
                }
            });
        });
    });
});
