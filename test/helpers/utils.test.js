const expect = require('chai').expect;

const { parseTime } = require('../../src/helpers/utils');

describe('utils', function () {
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
});
