/* global should */
const { getLocationData, getZoneData, parseTime } = require('../lib/utils');

describe('utils', () => {
    describe('getLocationData', () => {
        it('should return coords', () => {
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
        it('should return false for invalid latitude', () => {
            const badLatitude = {
                attributes: {
                    latitude: 'abc',
                    longitude: 1,
                },
            };
            const location = getLocationData(badLatitude);
            location.should.be.exactly(false);
        });
        it('should return false for invalid longitude', () => {
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
    describe('getZoneData', () => {
        it('should return coords and radius', () => {
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
        it('should return false for invalid radius', () => {
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

    describe('timeRegex', () => {
        it('should match hour and minutes', () => {
            const str = '21:28';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(21);
            minutes.should.be.exactly(28);
            seconds.should.be.exactly(0);
        });
        it('should match hour, minutes, and seconds', () => {
            const str = '21:28:10';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(21);
            minutes.should.be.exactly(28);
            seconds.should.be.exactly(10);
        });
        it('should match hour with leading zero', () => {
            const str = '01:58';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(1);
            minutes.should.be.exactly(58);
            seconds.should.be.exactly(0);
        });
        it('should match minute with leading zero', () => {
            const str = '01:08';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(1);
            minutes.should.be.exactly(8);
            seconds.should.be.exactly(0);
        });
        it('should match seconds with leading zero', () => {
            const str = '01:08:07';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(1);
            minutes.should.be.exactly(8);
            seconds.should.be.exactly(7);
        });
        it('should match midnight', () => {
            const str = '0:00:00';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(0);
            minutes.should.be.exactly(0);
            seconds.should.be.exactly(0);
        });
        it('should match midnight leading zero for hour', () => {
            const str = '00:00:00';
            const { hour, minutes, seconds } = parseTime(str);
            hour.should.be.exactly(0);
            minutes.should.be.exactly(0);
            seconds.should.be.exactly(0);
        });
        it('should not match time due to invalid hour', () => {
            const str = '25:68';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match time due to invalid minutes', () => {
            const str = '1:68';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match time due to invalid seconds', () => {
            const str = '1:58:61';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match a empty string', () => {
            const str = '';
            const matches = parseTime(str);
            should.not.exist(matches);
        });
        it('should not match a single digit', () => {
            const str = '0';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match all single zeros', () => {
            const str = '0:0:0';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match single digit minutes', () => {
            const str = '10:1:10';
            const results = parseTime(str);
            should.not.exist(results);
        });
        it('should not match single digit seconds', () => {
            const str = '10:10:1';
            const results = parseTime(str);
            should.not.exist(results);
        });
    });
});
