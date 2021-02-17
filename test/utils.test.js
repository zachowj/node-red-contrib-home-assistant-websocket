const expect = require('chai').expect;

const {
    getLocationData,
    getZoneData,
    parseTime,
} = require('../src/helpers/utils');

describe('utils', function () {
    describe('getLocationData', function () {
        it('should return coords', function () {
            const goodEntity = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                },
            };
            const location = getLocationData(goodEntity);
            expect(location).to.have.property('latitude');
            expect(location).to.have.property('longitude');
        });
        it('should return false for invalid latitude', function () {
            const badLatitude = {
                attributes: {
                    latitude: 'abc',
                    longitude: 1,
                },
            };
            const location = getLocationData(badLatitude);
            expect(location).to.be.false;
        });
        it('should return false for invalid longitude', function () {
            const badLongitude = {
                attributes: {
                    latitude: 1,
                    longitude: false,
                },
            };
            const location = getLocationData(badLongitude);
            expect(location).to.be.false;
        });
    });
    describe('getZoneData', function () {
        it('should return coords and radius', function () {
            const goodZone = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                    radius: 100,
                },
            };
            const location = getZoneData(goodZone);
            expect(location).to.have.property('latitude');
            expect(location).to.have.property('longitude');
            expect(location).to.have.property('radius');
        });
        it('should return false for invalid radius', function () {
            const badRadius = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                },
            };
            const location = getZoneData(badRadius);
            expect(location).to.be.false;
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
});
