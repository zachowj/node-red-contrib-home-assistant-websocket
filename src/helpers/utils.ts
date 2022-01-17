import EventEmitter from 'events';
import matchAll from 'string.prototype.matchall';

export function shouldInclude(
    targetString: string,
    includeRegex: RegExp | undefined,
    excludeRegex: RegExp | undefined
): boolean {
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

export function shouldIncludeEvent(
    eventId: string,
    filter: string,
    filterType: string
): boolean {
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

export function toCamelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) return '';
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

export function getWaitStatusText(
    timeout: number,
    timeoutUnits: string
): string {
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

export function getTimeInMilliseconds(
    value: number,
    valueUnits: string
): number {
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

function timeoutStatus(milliseconds = 0): string {
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

export function isValidDate(val: string | number): boolean {
    const d = new Date(val);
    return d instanceof Date && !isNaN(d.getTime());
}

export function parseTime(time: string):
    | {
          hour: number;
          minutes: number;
          seconds: number;
      }
    | undefined {
    const regex = /^(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
    const matches = time.match(regex);

    if (!matches) return;

    const [, hour, minutes, seconds = 0] = matches;

    return {
        hour: Number(hour),
        minutes: Number(minutes),
        seconds: Number(seconds),
    };
}

export function getEntitiesFromJsonata(jsonata: string): Set<string> {
    const regex = /\$entities\("([a-z_]+\.[a-z0-9_]+)"\)/g;
    const matches = matchAll(jsonata, regex);

    return new Set(Array.from(matches, (m) => m[1] as string));
}

export type EventsList = { [key: string]: (...args: any[]) => void };

export function addEventListeners(
    eventListeners: EventsList,
    emitter?: EventEmitter
): void {
    if (!emitter) return;

    Object.keys(eventListeners).forEach((event) => {
        emitter.on(event, eventListeners[event]);
    });
}

export function removeEventListeners(
    eventListeners: EventsList,
    emitter?: EventEmitter
): void {
    if (!emitter) return;

    Object.keys(eventListeners).forEach((event) => {
        emitter.off(event, eventListeners[event]);
    });
}

// export function containsMustache(str: string): boolean {
//     const regex = /\{\{(?:(?!}}).)+\}\}/g;
//     return regex.test(str);
// }
