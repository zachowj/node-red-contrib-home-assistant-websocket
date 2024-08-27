import { describe, expect, it } from 'vitest';

import {
    getLocationData,
    getZoneData,
    inZone,
} from '../../../src/nodes/zone/helpers';
import { locationData } from '../../../src/nodes/zone/ZoneController';

describe('location', function () {
    describe('getLocationData', function () {
        it('should return coords', function () {
            const goodEntity: any = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                },
            };
            const location = getLocationData(goodEntity);
            expect(location).toHaveProperty('latitude');
            expect(location).toHaveProperty('longitude');
        });

        it('should return undefined for invalid latitude', function () {
            const badLatitude: any = {
                attributes: {
                    latitude: 'abc',
                    longitude: 1,
                },
            };
            const location = getLocationData(badLatitude);
            expect(location).toEqual(undefined);
        });

        it('should return undefined for invalid longitude', function () {
            const badLongitude: any = {
                attributes: {
                    latitude: 1,
                    longitude: false,
                },
            };
            const location = getLocationData(badLongitude);
            expect(location).toEqual(undefined);
        });
    });

    describe('getZoneData', function () {
        it('should return coords and radius', function () {
            const goodZone: any = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                    radius: 100,
                },
            };
            const location = getZoneData(goodZone);
            expect(location).toHaveProperty('latitude');
            expect(location).toHaveProperty('longitude');
            expect(location).toHaveProperty('radius');
        });

        it('should return undefined for invalid radius', function () {
            const badRadius: any = {
                attributes: {
                    latitude: 1,
                    longitude: 1,
                },
            };
            const location = getZoneData(badRadius);
            expect(location).toEqual(undefined);
        });
    });

    describe('inZone', function () {
        it('should return true when location is within the zone radius', function () {
            const location: locationData = {
                latitude: 1,
                longitude: 1,
            };
            const zone: locationData = {
                latitude: 1,
                longitude: 1,
                radius: 100,
            };
            const result = inZone(location, zone);
            expect(result).toEqual(true);
        });

        it('should return false when location is outside the zone radius', function () {
            const location: locationData = {
                latitude: 2,
                longitude: 2,
            };
            const zone: locationData = {
                latitude: 1,
                longitude: 1,
                radius: 100,
            };
            const result = inZone(location, zone);
            expect(result).toEqual(false);
        });

        it('should return false when zone radius is 0', function () {
            const location: locationData = {
                latitude: 1,
                longitude: 1,
            };
            const zone: locationData = {
                latitude: 1,
                longitude: 1,
                radius: 0,
            };
            const result = inZone(location, zone);
            expect(result).toEqual(false);
        });
    });
});
