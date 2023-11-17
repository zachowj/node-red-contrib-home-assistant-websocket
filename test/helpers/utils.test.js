const expect = require('chai').expect;
const {
    toCamelCase,
    getEntitiesFromJsonata,
    validEntityId,
    shouldIncludeEvent,
    parseTime,
    isNodeRedEnvVar,
    containsMustache,
} = require('../../src/helpers/utils');

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

    describe('timeRegex', function () {
        it('should match hour and minutes', function () {
            const str = '21:28';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(21);
            expect(minutes).to.be.equal(28);
            expect(seconds).to.be.equal(0);
        });
        it('should match hour, minutes, and seconds', function () {
            const str = '21:28:10';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(21);
            expect(minutes).to.be.equal(28);
            expect(seconds).to.be.equal(10);
        });
        it('should match hour with leading zero', function () {
            const str = '01:58';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(1);
            expect(minutes).to.be.equal(58);
            expect(seconds).to.be.equal(0);
        });
        it('should match minute with leading zero', function () {
            const str = '01:08';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(1);
            expect(minutes).to.be.equal(8);
            expect(seconds).to.be.equal(0);
        });
        it('should match seconds with leading zero', function () {
            const str = '01:08:07';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(1);
            expect(minutes).to.be.equal(8);
            expect(seconds).to.be.equal(7);
        });
        it('should match midnight', function () {
            const str = '0:00:00';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(0);
            expect(minutes).to.be.equal(0);
            expect(seconds).to.be.equal(0);
        });
        it('should match midnight leading zero for hour', function () {
            const str = '00:00:00';
            const { hour, minutes, seconds } = parseTime(str);
            expect(hour).to.be.equal(0);
            expect(minutes).to.be.equal(0);
            expect(seconds).to.be.equal(0);
        });
        it('should not match time due to invalid hour', function () {
            const str = '25:68';
            const results = parseTime(str);
            expect(results).to.not.exist;
        });
        it('should not match time due to invalid minutes', function () {
            const str = '1:68';
            const results = parseTime(str);
            expect(results).to.not.exist;
        });
        it('should not match time due to invalid seconds', function () {
            const str = '1:58:61';
            const results = parseTime(str);
            expect(results).to.not.exist;
        });
        it('should not match a empty string', function () {
            const str = '';
            const matches = parseTime(str);
            expect(matches).to.not.exist;
        });
        it('should not match a single digit', function () {
            const str = '0';
            const results = parseTime(str);
            expect(results).to.not.exist;
        });
        it('should not match all single zeros', function () {
            const str = '0:0:0';
            const results = parseTime(str);
            expect(results).to.not.exist;
        });
        it('should not match single digit minutes', function () {
            const str = '10:1:10';
            const results = parseTime(str);
            expect(results).to.not.exist;
        });
        it('should not match single digit seconds', function () {
            const str = '10:10:1';
            const results = parseTime(str);
            expect(results).to.not.exist;
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
