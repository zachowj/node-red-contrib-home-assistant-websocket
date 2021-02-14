const geolib = require('geolib');
const selectn = require('selectn');

function shouldInclude(targetString, includeRegex, excludeRegex) {
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
}

function shouldIncludeEvent(eventId, filter, filterType) {
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
}

function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function inZone(location, zone) {
    const { radius, ...zoneLatLog } = zone;
    const inZone = geolib.isPointWithinRadius(location, zoneLatLog, radius);

    return inZone;
}

function getLocationData(entity) {
    const coord = {
        latitude: entity.attributes.latitude,
        longitude: entity.attributes.longitude,
    };

    return geolib.isValidCoordinate(coord) ? coord : false;
}

function getZoneData(zone) {
    const data = getLocationData(zone);
    if (data === false || selectn('attributes.radius', zone) === undefined)
        return false;

    data.radius = zone.attributes.radius;

    return data;
}

function getWaitStatusText(timeout, timeoutUnits) {
    const timeoutMs = getTimeInMilliseconds(timeout, timeoutUnits);
    switch (timeoutUnits) {
        case 'milliseconds':
            return `waiting for ${timeout} milliseconds`;
        case 'hours':
        case 'days':
            return `waiting until ${timeoutStatus(timeoutMs)}`;
        case 'minutes':
        default:
            return `waiting for ${timeout} ${timeoutUnits}: ${timeoutStatus(
                timeoutMs
            )}`;
    }
}

function getTimeInMilliseconds(value, valueUnits) {
    switch (valueUnits) {
        case 'milliseconds':
            return value;
        case 'minutes':
            return value * 60000;
        case 'hours':
            return value * 3.6e6;
        case 'days':
            return value * 8.64e7;
        default:
            return value * 1000;
    }
}

function timeoutStatus(milliseconds = 0) {
    const timeout = Date.now() + milliseconds;
    const timeoutStr = new Date(timeout).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });

    return timeoutStr;
}

function isValidDate(val) {
    const d = new Date(val);
    return d instanceof Date && !isNaN(d);
}

function parseTime(time) {
    const regex = /^(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
    const matches = time.match(regex);

    if (!matches) return matches;

    const [, hour, minutes, seconds = 0] = matches;

    return {
        hour: Number(hour),
        minutes: Number(minutes),
        seconds: Number(seconds),
    };
}

function getEntitiesFromJsonata(jsonata) {
    const regex = /\$entities\("([a-z_]+\.[a-z0-9_]+)"\)/g;
    const matches = jsonata.matchAll(regex);

    return new Set(Array.from(matches, (m) => m[1]));
}

module.exports = {
    shouldInclude,
    shouldIncludeEvent,
    toCamelCase,
    inZone,
    getLocationData,
    getZoneData,
    getWaitStatusText,
    getTimeInMilliseconds,
    isValidDate,
    parseTime,
    getEntitiesFromJsonata,
};
