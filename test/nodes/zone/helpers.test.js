const expect = require('chai').expect;

const {
    getLocationData,
    getZoneData,
} = require('../../src/nodes/zone/helpers');

describe('location', function () {
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
});
