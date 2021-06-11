import { isPointWithinRadius, isValidCoordinate } from 'geolib';
import { HassEntity } from 'home-assistant-js-websocket';

type locationData = {
    latitude: number;
    longitude: number;
    radius?: number;
};

export function inZone(location: locationData, zone: locationData): boolean {
    const { radius = 0, ...zoneLatLog } = zone;
    const inZone = isPointWithinRadius(location, zoneLatLog, radius);

    return inZone;
}

export function getLocationData(entity: HassEntity): locationData | false {
    const coord = {
        latitude: entity.attributes.latitude,
        longitude: entity.attributes.longitude,
    };

    return isValidCoordinate(coord) ? coord : false;
}

export function getZoneData(zone: HassEntity): locationData | boolean {
    const data = getLocationData(zone);
    if (data === false || zone?.attributes?.radius === undefined) return false;

    data.radius = zone.attributes.radius;

    return data;
}
