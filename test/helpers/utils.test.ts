import { describe, expect, it } from 'vitest';

import {
    containsMustache,
    getEntitiesFromJsonata,
    isNodeRedEnvVar,
    parseTime,
    shouldIncludeEvent,
    toCamelCase,
    validEntityId,
} from '../../src/helpers/utils';

describe('utils', function () {
    describe('containsMustache', function () {
        it('should return true for strings containing mustache syntax', function () {
            expect(containsMustache('{{hello}}')).toEqual(true);
            expect(containsMustache('Hello, {{name}}!')).toEqual(true);
            expect(containsMustache('{{firstName}} {{lastName}}')).toEqual(
                true,
            );
        });

        it('should return false for strings not containing mustache syntax', function () {
            expect(containsMustache('Hello, world!')).toEqual(false);
            expect(containsMustache('{{hello')).toEqual(false);
            expect(containsMustache('hello}}')).toEqual(false);
        });
    });

    describe('getEntitiesFromJsonata', function () {
        it('should return a set of entities from a JSONata expression', function () {
            const jsonata =
                '$entities("domain.service") + $entities("domain.service2")';
            const result = getEntitiesFromJsonata(jsonata);
            expect(result).toHaveLength(2);
            expect(result).toContain('domain.service');
            expect(result).toContain('domain.service2');
        });

        it('should return an empty set if no entities are found', function () {
            const jsonata = '2 + 2';
            const result = getEntitiesFromJsonata(jsonata);
            expect(result).toHaveLength(0);
        });

        it('should ignore invalid entity names', function () {
            const jsonata =
                '$entities("device.name") + $entities("invalid_entity")';
            const result = getEntitiesFromJsonata(jsonata);
            expect(result).toHaveLength(1);
            expect(result).toContain('device.name');
        });
    });

    describe('isNodeRedEnvVar', function () {
        it('should return true for valid Node-RED environment variables', function () {
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${env_var}')).toEqual(true);
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${ENV_VAR}')).toEqual(true);
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${envVar123}')).toEqual(true);
        });

        it('should return false for invalid Node-RED environment variables', function () {
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${env-var}')).toEqual(false);
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${123envVar}')).toEqual(false);
            expect(isNodeRedEnvVar('envVar')).toEqual(false);
            expect(isNodeRedEnvVar('${envVar')).toEqual(false);
            expect(isNodeRedEnvVar('envVar}')).toEqual(false);
        });
    });

    describe('shouldIncludeEvent', function () {
        it('should return true when filter is empty', function () {
            expect(shouldIncludeEvent('test', '', 'exact')).toEqual(true);
        });

        it('should match a substring', function () {
            expect(shouldIncludeEvent('test', 'es', 'substring')).toEqual(true);
        });

        it('should match regex', function () {
            expect(shouldIncludeEvent('test', 't[ea]st', 'regex')).toEqual(
                true,
            );
        });

        it('should match exactly', function () {
            expect(shouldIncludeEvent('test', 'test', 'exact')).toEqual(true);
        });

        it('should match a string in a array', function () {
            expect(
                shouldIncludeEvent('test', ['test', 'test2'], 'list'),
            ).toEqual(true);
        });

        it('should not match a substring', function () {
            expect(shouldIncludeEvent('test', 'abc', 'substring')).toEqual(
                false,
            );
        });

        it('should not match regex', function () {
            expect(shouldIncludeEvent('test', 'a[b]c', 'regex')).toEqual(false);
        });

        it('should not match exactly', function () {
            expect(shouldIncludeEvent('test', 'abc', 'exact')).toEqual(false);
        });

        it('should not match a string in a array', function () {
            expect(
                shouldIncludeEvent('test', ['abc', 'test2'], 'list'),
            ).toEqual(false);
        });
    });

    describe('toCamelCase', function () {
        it('should convert strings to camel case', function () {
            expect(toCamelCase('Home Assistant')).toEqual('homeAssistant');
            expect(toCamelCase('hello world')).toEqual('helloWorld');
            expect(toCamelCase('HELLO WORLD')).toEqual('helloWorld');
            expect(toCamelCase('HelloWorld')).toEqual('helloWorld');
            expect(toCamelCase('hello_world')).toEqual('helloWorld');
        });

        it('should handle single word strings', function () {
            expect(toCamelCase('hello')).toEqual('hello');
            expect(toCamelCase('HELLO')).toEqual('hello');
        });

        it('should handle empty strings', function () {
            expect(toCamelCase('')).toEqual('');
        });
    });

    describe('parseTime', function () {
        it('should parse valid time strings', function () {
            expect(parseTime('00:00')).toEqual({
                hour: 0,
                minutes: 0,
                seconds: 0,
            });
            expect(parseTime('01:30')).toEqual({
                hour: 1,
                minutes: 30,
                seconds: 0,
            });
            expect(parseTime('12:00:01')).toEqual({
                hour: 12,
                minutes: 0,
                seconds: 1,
            });
            expect(parseTime('23:59:59')).toEqual({
                hour: 23,
                minutes: 59,
                seconds: 59,
            });
            expect(parseTime('09:05:30')).toEqual({
                hour: 9,
                minutes: 5,
                seconds: 30,
            });
        });

        it('should return undefined for invalid time strings', function () {
            expect(parseTime('')).toEqual(undefined);
            expect(parseTime('0:0')).toEqual(undefined);
            expect(parseTime('24:00')).toEqual(undefined);
            expect(parseTime('00:60')).toEqual(undefined);
            expect(parseTime('00:00:60')).toEqual(undefined);
            expect(parseTime('abc')).toEqual(undefined);
            expect(parseTime('12:34:56:78')).toEqual(undefined);
        });
    });

    describe('validEntityId', function () {
        it('should return true for valid entity IDs', function () {
            expect(validEntityId('domain_1.entity_1')).toEqual(true);
            expect(validEntityId('domain_2.entity_2')).toEqual(true);
        });

        it('should return false for invalid entity IDs', function () {
            expect(validEntityId('domain..entity')).toEqual(false);
            expect(validEntityId('domain.entity.')).toEqual(false);
            expect(validEntityId('.domain.entity')).toEqual(false);
            expect(validEntityId('domain_.entity')).toEqual(false);
            expect(validEntityId('domain._entity')).toEqual(false);
            expect(validEntityId('domain.__entity')).toEqual(false);
        });
    });
});
