import { describe, expect, it, vi } from 'vitest';

import { EventsList } from '../../../src/common/events/Events';
import {
    addEventListeners,
    containsMustache,
    getEntitiesFromJsonata,
    getTimeInMilliseconds,
    isNodeRedEnvVar,
    parseTime,
    parseValueToBoolean,
    shouldInclude,
    shouldIncludeEvent,
    toCamelCase,
    validEntityId,
} from '../../../src/helpers/utils';

describe('utils', function () {
    describe('shouldInclude', function () {
        it('should include everything if no regex is passed', function () {
            expect(shouldInclude('test', undefined, undefined)).toBe(true);
            expect(shouldInclude('test', undefined, /test/)).toBe(false);
            expect(shouldInclude('test', /test/, undefined)).toBe(true);
        });

        it('should include everything if target string is empty', function () {
            expect(shouldInclude('', /test/, /test/)).toBe(true);
        });

        it('should include if target string matches include regex', function () {
            expect(shouldInclude('test', /test/, /abc/)).toBe(true);
            expect(shouldInclude('test', /test/, /test/)).toBe(false);
            expect(shouldInclude('test', /test/, /abc/)).toBe(true);
        });

        it('should exclude if target string matches exclude regex', function () {
            expect(shouldInclude('test', /abc/, /test/)).toBe(false);
            expect(shouldInclude('test', /abc/, /abc/)).toBe(false);
            expect(shouldInclude('test', /abc/, /abc/)).toBe(false);
        });

        it('should include if target string matches include regex and not exclude regex', function () {
            expect(shouldInclude('test', /test/, /abc/)).toBe(true);
            expect(shouldInclude('test', /test/, /abc/)).toBe(true);
        });

        it('should exclude if target string matches exclude regex and not include regex', function () {
            expect(shouldInclude('test', /abc/, /test/)).toBe(false);
            expect(shouldInclude('test', /abc/, /test/)).toBe(false);
        });
    });

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

    describe('getTimeInMilliseconds', function () {
        it('should return the time in milliseconds', function () {
            expect(getTimeInMilliseconds(500, 'milliseconds')).toEqual(500);
            expect(getTimeInMilliseconds(1, 'seconds')).toEqual(1000);
            expect(getTimeInMilliseconds(1, 'minutes')).toEqual(60000);
            expect(getTimeInMilliseconds(1, 'hours')).toEqual(3600000);
            expect(getTimeInMilliseconds(1, 'days')).toEqual(86400000);
            expect(getTimeInMilliseconds(1, 'unknown')).toEqual(1000);
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

    describe('addEventListeners', function () {
        const emitter = {
            on: vi.fn(),
            addListener: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
            off: vi.fn(),
            removeAllListeners: vi.fn(),
            setMaxListeners: vi.fn(),
            getMaxListeners: vi.fn(),
            listeners: vi.fn(),
            rawListeners: vi.fn(),
            emit: vi.fn(),
            listenerCount: vi.fn(),
            prependListener: vi.fn(),
            prependOnceListener: vi.fn(),
            eventNames: vi.fn(),
        };

        it('should add event listeners to event emitter', function () {
            const eventListeners: EventsList = [
                ['event1', vi.fn()],
                ['event2', vi.fn()],
            ];

            addEventListeners(eventListeners, emitter);

            expect(emitter.on).toHaveBeenCalledTimes(2);
            expect(emitter.on).toHaveBeenCalledWith(
                'event1',
                eventListeners[0][1],
            );
            expect(emitter.on).toHaveBeenCalledWith(
                'event2',
                eventListeners[1][1],
            );
        });
    });

    describe('convertStringToBoolean', () => {
        it('should return true for boolean true', () => {
            expect(parseValueToBoolean(true)).toBe(true);
        });

        it('should return false for boolean false', () => {
            expect(parseValueToBoolean(false)).toBe(false);
        });

        it('should return true for number 1', () => {
            expect(parseValueToBoolean(1)).toBe(true);
        });

        it('should return false for number 0', () => {
            expect(parseValueToBoolean(0)).toBe(false);
        });

        it('should return true for string "true" (case-insensitive)', () => {
            expect(parseValueToBoolean('true')).toBe(true);
            expect(parseValueToBoolean('TRUE')).toBe(true);
            expect(parseValueToBoolean(' True ')).toBe(true);
        });

        it('should return false for string "false" (case-insensitive)', () => {
            expect(parseValueToBoolean('false')).toBe(false);
            expect(parseValueToBoolean('FALSE')).toBe(false);
            expect(parseValueToBoolean(' False ')).toBe(false);
        });

        it('should return true for numeric strings representing non-zero', () => {
            expect(parseValueToBoolean('1')).toBe(true);
            expect(parseValueToBoolean('42')).toBe(true);
            expect(parseValueToBoolean(' 7 ')).toBe(true);
        });

        it('should return false for numeric string "0"', () => {
            expect(parseValueToBoolean('0')).toBe(false);
            expect(parseValueToBoolean(' 0 ')).toBe(false);
        });

        it('should return false for unrecognized strings', () => {
            expect(parseValueToBoolean('foo')).toBe(false);
            expect(parseValueToBoolean('')).toBe(false);
            expect(parseValueToBoolean('yes')).toBe(false);
            expect(parseValueToBoolean('no')).toBe(false);
        });

        it('should return false for undefined and null', () => {
            expect(parseValueToBoolean(undefined as any)).toBe(false);
            expect(parseValueToBoolean(null as any)).toBe(false);
        });
    });
});
