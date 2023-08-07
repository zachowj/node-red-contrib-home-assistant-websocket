import { isPointWithinRadius, isValidCoordinate } from 'geolib';

import { HassEntity } from '../../types/home-assistant';
import { locationData } from './ZoneController';

export function inZone(location: locationData, zone: locationData): boolean {
    const { radius = 0, ...zoneLatLog } = zone;
    const inZone = isPointWithinRadius(location, zoneLatLog, radius);

    return inZone;
}

export function getLocationData(entity: HassEntity): locationData | undefined {
    const coord = {
        latitude: entity.attributes.latitude,
        longitude: entity.attributes.longitude,
    };

    return isValidCoordinate(coord) ? coord : undefined;
}

export function getZoneData(zone: HassEntity): locationData | undefined {
    const data = getLocationData(zone);
    if (data === undefined || zone?.attributes?.radius === undefined) return;

    data.radius = zone.attributes.radius;

    return data;
}
