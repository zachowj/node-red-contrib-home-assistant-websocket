import Joi from 'joi';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import InputService, {
    DataSource,
    ParsedMessage,
} from '../../../../src/common/services/InputService';
import { NodeProperties } from '../../../../src/types/nodes';

interface TestNode extends NodeProperties {
    foo?: string;
}

describe('Input Service', function () {
    describe('parse', function () {
        let nodeConfig: TestNode;
        let schema: Joi.ObjectSchema;

        beforeAll(function () {
            schema = Joi.object();
        });

        beforeEach(function () {
            nodeConfig = {
                id: '',
                type: '',
                name: '',
                z: '',
                version: 0,
            };
        });

        it('should use message value over config value if message value is defined', function () {
            const config = { ...nodeConfig, foo: 'bar' };
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: 'payload',
                        configProp: 'foo',
                    },
                },
                nodeConfig: config,
                schema,
            });

            const msg = {
                payload: 'from message',
            };

            const parsed = inputService.parse(msg);

            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'message',
                    value: 'from message',
                },
            });
        });

        it('should use the lowest indices when messageProp is an array', function () {
            const config = { ...nodeConfig, foo: 'bar' };
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: ['topic', 'payload'],
                        configProp: 'foo',
                    },
                },
                nodeConfig: config,
                schema,
            });

            const msg = {
                payload: 'from payload',
                topic: 'from topic',
            };

            const parsed = inputService.parse(msg);

            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'message',
                    value: 'from topic',
                },
            });
        });

        it('should use config value if message value is undefined', function () {
            const config = { ...nodeConfig, foo: 'bar' };
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: 'payload',
                        configProp: 'foo',
                    },
                },
                nodeConfig: config,
                schema,
            });

            const msg = {};

            const parsed = inputService.parse(msg);

            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'config',
                    value: 'bar',
                },
            });
        });

        it('should use default value if message value is undefined and config value is undefined', function () {
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: 'payload',
                        configProp: 'foo',
                        default: 'default value',
                    },
                },
                nodeConfig,
                schema,
            });

            const msg = {};

            const parsed = inputService.parse(msg);

            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'default',
                    value: 'default value',
                },
            });
        });

        it('should set source to missing if message value is undefined and config value is undefined and default is undefined', function () {
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: 'payload',
                        configProp: 'foo',
                    },
                },
                nodeConfig,
                schema,
            });

            const msg = {};

            const parsed = inputService.parse(msg);

            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'missing',
                    value: undefined,
                },
            });
        });

        it('should return value of nested object', function () {
            const config = { ...nodeConfig, foo: 'barbar' };
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: 'payload.foo',
                        configProp: 'foo',
                    },
                },
                nodeConfig: config,
                schema,
            });

            const msg = {
                payload: {
                    foo: 'bar',
                },
            };

            const parsed = inputService.parse(msg);

            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'message',
                    value: 'bar',
                },
            });
        });

        it('should ignore message values if block input override is enabled', function () {
            const config = { ...nodeConfig, foo: 'bar' };
            const inputService = new InputService<TestNode>({
                inputs: {
                    foobar: {
                        messageProp: 'payload',
                        configProp: 'foo',
                    },
                },
                nodeConfig: config,
                schema,
            });
            inputService.disableInputOverrides();

            const msg = {
                payload: 'from message',
            };

            const parsed = inputService.parse(msg);
            expect(parsed).toEqual({
                foobar: {
                    key: 'foobar',
                    source: 'config',
                    value: 'bar',
                },
            });
        });
    });

    describe('validate', function () {
        let nodeConfig: TestNode;

        beforeEach(function () {
            nodeConfig = {
                id: '',
                type: '',
                name: '',
                z: '',
                version: 0,
            };
        });

        it('should return true if required properties are set', function () {
            const schema = Joi.object({
                foo: Joi.string().required(),
            });
            const inputService = new InputService<TestNode>({
                inputs: {},
                nodeConfig,
                schema,
            });

            const parsedMessage: ParsedMessage = {
                foo: {
                    key: 'test',
                    value: 'foobar',
                    source: DataSource.Config,
                },
            };

            const result = inputService.validate(parsedMessage);

            expect(result).toBe(true);
        });

        it('should throw ValidationError if required properties are not set', function () {
            const schema = Joi.object({
                foo: Joi.string().required(),
            });
            const inputService = new InputService<TestNode>({
                inputs: {},
                nodeConfig,
                schema,
            });

            const parsedMessage: ParsedMessage = {};

            expect(() => inputService.validate(parsedMessage)).toThrowError(
                /^"foo" is required$/,
            );
        });
    });

    describe('validateSchema', function () {
        it('should return true if schema is valid', function () {
            const schema = Joi.object({
                foo: Joi.string().required(),
            });
            const result = InputService.validateSchema(schema, { foo: 'bar' });

            expect(result).toBe(true);
        });

        it('should throw ValidationError if schema is invalid', function () {
            const schema = Joi.object({
                foo: Joi.string().required(),
            });
            expect(() => InputService.validateSchema(schema, {})).toThrowError(
                /^"foo" is required$/,
            );
        });
    });
});
