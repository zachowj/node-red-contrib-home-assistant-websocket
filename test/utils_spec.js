const helper = require('node-red-node-test-helper');

const { getLocationData, getZoneData } = require('../lib/utils');

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
});
