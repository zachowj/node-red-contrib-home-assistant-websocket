import { expect } from 'chai';

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
            expect(containsMustache('{{hello}}')).to.be.true;
            expect(containsMustache('Hello, {{name}}!')).to.be.true;
            expect(containsMustache('{{firstName}} {{lastName}}')).to.be.true;
        });

        it('should return false for strings not containing mustache syntax', function () {
            expect(containsMustache('Hello, world!')).to.be.false;
            expect(containsMustache('{{hello')).to.be.false;
            expect(containsMustache('hello}}')).to.be.false;
        });
    });

    describe('getEntitiesFromJsonata', function () {
        it('should return a set of entities from a JSONata expression', function () {
            const jsonata =
                '$entities("domain.service") + $entities("domain.service2")';
            const result = getEntitiesFromJsonata(jsonata);
            expect(result)
                .to.be.a('set')
                .to.have.lengthOf(2)
                .to.include('domain.service')
                .to.include('domain.service2');
        });

        it('should return an empty set if no entities are found', function () {
            const jsonata = '2 + 2';
            const result = getEntitiesFromJsonata(jsonata);
            expect(result).to.be.empty;
        });

        it('should ignore invalid entity names', function () {
            const jsonata =
                '$entities("device.name") + $entities("invalid_entity")';
            const result = getEntitiesFromJsonata(jsonata);
            expect(result)
                .to.be.a('set')
                .to.have.lengthOf(1)
                .to.include('device.name');
        });
    });

    describe('isNodeRedEnvVar', function () {
        it('should return true for valid Node-RED environment variables', function () {
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${env_var}')).to.be.true;
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${ENV_VAR}')).to.be.true;
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${envVar123}')).to.be.true;
        });

        it('should return false for invalid Node-RED environment variables', function () {
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${env-var}')).to.be.false;
            // eslint-disable-next-line no-template-curly-in-string
            expect(isNodeRedEnvVar('${123envVar}')).to.be.false;
            expect(isNodeRedEnvVar('envVar')).to.be.false;
            expect(isNodeRedEnvVar('${envVar')).to.be.false;
            expect(isNodeRedEnvVar('envVar}')).to.be.false;
        });
    });

    describe('shouldIncludeEvent', function () {
        it('should return true when filter is empty', function () {
            expect(shouldIncludeEvent('test', '', 'exact')).to.be.true;
        });
        it('should match a substring', function () {
            expect(shouldIncludeEvent('test', 'es', 'substring')).to.be.true;
        });
        it('should match regex', function () {
            expect(shouldIncludeEvent('test', 't[ea]st', 'regex')).to.be.true;
        });
        it('should match exactly', function () {
            expect(shouldIncludeEvent('test', 'test', 'exact')).to.be.true;
        });
        it('should match a string in a array', function () {
            expect(shouldIncludeEvent('test', ['test', 'test2'], 'list')).to.be
                .true;
        });
        it('should not match a substring', function () {
            expect(shouldIncludeEvent('test', 'abc', 'substring')).to.be.false;
        });
        it('should not match regex', function () {
            expect(shouldIncludeEvent('test', 'a[b]c', 'regex')).to.be.false;
        });
        it('should not match exactly', function () {
            expect(shouldIncludeEvent('test', 'abc', 'exact')).to.be.false;
        });
        it('should not match a string in a array', function () {
            expect(shouldIncludeEvent('test', ['abc', 'test2'], 'list')).to.be
                .false;
        });
    });

    describe('toCamelCase', function () {
        it('should convert strings to camel case', function () {
            expect(toCamelCase('Home Assistant')).to.be.equal('homeAssistant');
            expect(toCamelCase('hello world')).to.be.equal('helloWorld');
            expect(toCamelCase('HELLO WORLD')).to.be.equal('helloWorld');
            expect(toCamelCase('HelloWorld')).to.be.equal('helloWorld');
            expect(toCamelCase('hello_world')).to.be.equal('helloWorld');
        });

        it('should handle single word strings', function () {
            expect(toCamelCase('hello')).to.be.equal('hello');
            expect(toCamelCase('HELLO')).to.be.equal('hello');
        });

        it('should handle empty strings', function () {
            expect(toCamelCase('')).to.be.equal('');
        });
    });

    describe('parseTime', function () {
        it('should parse valid time strings', function () {
            expect(parseTime('00:00')).to.deep.equal({
                hour: 0,
                minutes: 0,
                seconds: 0,
            });
            expect(parseTime('01:30')).to.deep.equal({
                hour: 1,
                minutes: 30,
                seconds: 0,
            });
            expect(parseTime('12:00:01')).to.deep.equal({
                hour: 12,
                minutes: 0,
                seconds: 1,
            });
            expect(parseTime('23:59:59')).to.deep.equal({
                hour: 23,
                minutes: 59,
                seconds: 59,
            });
            expect(parseTime('09:05:30')).to.deep.equal({
                hour: 9,
                minutes: 5,
                seconds: 30,
            });
        });

        it('should return undefined for invalid time strings', function () {
            expect(parseTime('')).to.be.undefined;
            expect(parseTime('0:0')).to.be.undefined;
            expect(parseTime('24:00')).to.be.undefined;
            expect(parseTime('00:60')).to.be.undefined;
            expect(parseTime('00:00:60')).to.be.undefined;
            expect(parseTime('abc')).to.be.undefined;
            expect(parseTime('12:34:56:78')).to.be.undefined;
        });
    });

    describe('validEntityId', function () {
        it('should return true for valid entity IDs', function () {
            expect(validEntityId('domain_1.entity_1')).to.be.true;
            expect(validEntityId('domain_2.entity_2')).to.be.true;
        });

        it('should return false for invalid entity IDs', function () {
            expect(validEntityId('domain..entity')).to.be.false;
            expect(validEntityId('domain.entity.')).to.be.false;
            expect(validEntityId('.domain.entity')).to.be.false;
            expect(validEntityId('domain_.entity')).to.be.false;
            expect(validEntityId('domain._entity')).to.be.false;
            expect(validEntityId('domain.__entity')).to.be.false;
        });
    });
});
