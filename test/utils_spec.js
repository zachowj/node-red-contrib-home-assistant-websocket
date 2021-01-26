/* global should */
const { getLocationData, getZoneData, parseTime } = require('../lib/utils');

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
            location.should.have.property('latitude');
            location.should.have.property('longitude');
        });
        it('should return false for invalid latitude', function () {
            const badLatitude = {
                attributes: {
                    latitude: 'abc',
                    longitude: 1,
                },
            };
            const location = getLocationData(badLatitude);
            location.should.be.exactly(false);
        });
        it('should return false for invalid longitude', function () {
            const badLongitude = {
                attributes: {
                    latitude: 1,
                    longitude: false,
                },
            };
            const location = getLocationData(badLongitude);
            location.should.be.exactly(false);
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
            location.should.have.property('latitude');
            location.should.have.property('longitude');
            location.should.have.property('radius');
        });
        it('should return false for invalid radius', function () {
            const badRadius = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                },
            };
            const location = getZoneData(badRadius);
            location.should.be.exactly(false);
        });
    });

    describe('timeRegex', function () {
        it('should match hour and minutes', function () {
            const str = '21:28';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(21);
            minutes.should.be.exactly(28);
            seconds.should.be.exactly(0);
        });
        it('should match hour, minutes, and seconds', function () {
            const str = '21:28:10';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(21);
            minutes.should.be.exactly(28);
            seconds.should.be.exactly(10);
        });
        it('should match hour with leading zero', function () {
            const str = '01:58';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(1);
            minutes.should.be.exactly(58);
            seconds.should.be.exactly(0);
        });
        it('should match minute with leading zero', function () {
            const str = '01:08';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(1);
            minutes.should.be.exactly(8);
            seconds.should.be.exactly(0);
        });
        it('should match seconds with leading zero', function () {
            const str = '01:08:07';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(1);
            minutes.should.be.exactly(8);
            seconds.should.be.exactly(7);
        });
        it('should match midnight', function () {
            const str = '0:00:00';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(0);
            minutes.should.be.exactly(0);
            seconds.should.be.exactly(0);
        });
        it('should match midnight leading zero for hour', function () {
            const str = '00:00:00';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(0);
            minutes.should.be.exactly(0);
            seconds.should.be.exactly(0);
        });
        it('should not match time due to invalid hour', function () {
            const str = '25:68';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match time due to invalid minutes', function () {
            const str = '1:68';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match time due to invalid seconds', function () {
            const str = '1:58:61';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match a empty string', function () {
            const str = '';
            const matches = parseTime(str);
            should.not.exist(matches);
        });
        it('should not match a single digit', function () {
            const str = '0';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match all single zeros', function () {
            const str = '0:0:0';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match single digit minutes', function () {
            const str = '10:1:10';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match single digit seconds', function () {
            const str = '10:10:1';
            const results = parseTime(str);
            should.not.exist(results);
        });
    });
});
