const geolib = require('geolib');
const selectn = require('selectn');

const utils = (module.exports = {});

utils.shouldInclude = (targetString, includeRegex, excludeRegex) => {
    if (!targetString || (!includeRegex && !excludeRegex)) {
        return true;
    }

    // If include regex isn't passed then include everything since test will be skipped
    // otherwise default to false and set in regex test
    let shouldIncludeTest = !includeRegex;
    let shouldExcludeTest = false;

    if (includeRegex && includeRegex.test(targetString)) {
        shouldIncludeTest = true;
    }
    if (excludeRegex && excludeRegex.test(targetString)) {
        shouldExcludeTest = true;
    }

    return shouldIncludeTest && !shouldExcludeTest;
};

utils.shouldIncludeEvent = (eventId, filter, filterType) => {
    if (!filter) return true;

    if (filterType === 'substring') {
        const found = filter
            .split(',')
            .map((f) => f.trim())
            .filter((filterStr) => eventId.indexOf(filterStr) >= 0);
        return found.length > 0;
    }

    if (filterType === 'regex') {
        return new RegExp(filter).test(eventId);
    }

    return filter === eventId;
};

utils.toCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

utils.inZone = (location, zone) => {
    const { radius, ...zoneLatLog } = zone;
    const inZone = geolib.isPointWithinRadius(location, zoneLatLog, radius);

    return inZone;
};

utils.getLocationData = (entity) => {
    const coord = {
        latitude: entity.attributes.latitude,
        longitude: entity.attributes.longitude,
    };

    return geolib.isValidCoordinate(coord) ? coord : false;
};

utils.getZoneData = (zone) => {
    const data = utils.getLocationData(zone);
    if (data === false || selectn('attributes.radius', zone) === undefined)
        return false;

    data.radius = zone.attributes.radius;

    return data;
};
