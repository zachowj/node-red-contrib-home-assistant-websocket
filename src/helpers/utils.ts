import EventEmitter from 'events';

import { EventsList } from '../common/events/Events';
import { RED } from '../globals';
import { DeviceNode } from '../nodes/device';
import { BaseNode } from '../types/nodes';

export function shouldInclude(
    targetString: string,
    includeRegex: RegExp | undefined,
    excludeRegex: RegExp | undefined,
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
    filter: string | string[],
    filterType: string,
): boolean {
    if (!filter) return true;

    if (typeof filter === 'string') {
        if (filterType === 'substring') {
            return eventId.includes(filter);
        }
        if (filterType === 'regex') {
            return new RegExp(filter).test(eventId);
        }
    }

    if (Array.isArray(filter)) {
        return filter.includes(eventId);
    }

    return eventId === filter;
}

/**
 * Converts a string to camel case.
 * @param str - The string to convert.
 * @returns The camel case string.
 */
export function toCamelCase(str: string): string {
    const wordPattern =
        /[A-Z][a-z]+|[A-Z]+(?=[A-Z][a-z])|[A-Z]+|[a-z]+|[0-9]+/g;

    const upperFirst = (str: string): string =>
        str.charAt(0).toUpperCase() + str.slice(1);

    return (str.match(wordPattern) ?? [])
        .map((word, index) =>
            index === 0
                ? word.toLocaleLowerCase()
                : upperFirst(word.toLowerCase()),
        )
        .join('');
}

/**
 * Returns a string describing the wait status based on the provided timeout and units.
 * @param timeout - The amount of time to wait.
 * @param timeoutUnits - The units of time for the timeout (milliseconds, minutes, hours, or days).
 * @returns A string describing the wait status.
 */
export function getWaitStatusText(
    timeout: number,
    timeoutUnits: string,
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
                timeoutMs,
            )}`;
    }
}

/**
 * Converts a time value in various units to milliseconds.
 * @param value - The time value to convert.
 * @param valueUnits - The units of the time value.
 * @returns The time value in milliseconds.
 */
export function getTimeInMilliseconds(
    value: number,
    valueUnits: string,
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

/**
 * Returns a formatted string representing a timeout date and time.
 * @param milliseconds - The number of milliseconds until the timeout.
 * @returns A string representing the timeout date and time in the format "MMM d, HH:mm:ss".
 */
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

/**
 * Checks if a given value is a valid date.
 * @param val - The value to check.
 * @returns True if the value is a valid date, false otherwise.
 */
export function isValidDate(val: string | number): boolean {
    const d = new Date(val);
    return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Parses a string representing a time in the format "HH:mm:ss" and returns an object with the hour, minutes, and seconds.
 * @param time - The time string to parse.
 * @returns An object with the hour, minutes, and seconds, or undefined if the input string is not in the correct format.
 */
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
    // This regular expression matches the pattern $entities('...') or $entities("...") in a string.
    // It is used to extract all entity names from a JSONata expression that uses the $entities function.
    // The regular expression has a global flag (g) which means it will find all matches in the string, not just the first one.
    const regex = /\$entities\((?:'([^']*)'|"([^"]*)")\)/g;
    const matches = jsonata.matchAll(regex);
    return new Set(
        Array.from(matches)
            .map((match) => match[1] || match[2])
            .filter((entityId) => validEntityId(entityId)),
    );
}

export function addEventListeners(
    eventListeners: EventsList,
    emitter?: EventEmitter,
): void {
    if (!emitter) return;

    eventListeners.forEach(([event, callback]) => {
        emitter.on(event, callback);
    });
}

export function removeEventListeners(
    eventListeners: EventsList,
    emitter?: EventEmitter,
): void {
    if (!emitter) return;

    eventListeners.forEach(([event, callback]) => {
        emitter.off(event, callback);
    });
}

// https://github.com/home-assistant/core/blob/77ee72cbb9fed55779b0ee58443c3f41e5b35f5a/homeassistant/core.py#L125
export function validEntityId(entityId: string): boolean {
    return /^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)$/.test(
        entityId,
    );
}

export function isNodeRedEnvVar(envVar: string) {
    // Check for ${env-var}
    return /^\$\{[a-zA-Z_][a-zA-Z0-9_]*\}$/.test(envVar);
}

export function checkValidServerConfig(
    node: BaseNode | DeviceNode,
    serverNodeId?: string,
): boolean {
    const serverConfigNode = RED.nodes.getNode(serverNodeId ?? '');

    if (!serverConfigNode) {
        node.status({
            fill: 'red',
            shape: 'dot',
            text: RED._('home-assistant.status.error'),
        });
        throw new Error('Server config node not found');
    }

    return true;
}

export function containsMustache(str: string): boolean {
    const regex = /{{(?:(?!}}).+)}}/g;
    return regex.test(str);
}

/**
 * Converts a string to a boolean value.
 * Accepts "true"/"false" (case-insensitive), numeric strings, and numbers.
 * Returns false for unrecognized values.
 * @param str - The string to convert.
 * @returns The boolean representation.
 */
export function parseValueToBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return Boolean(value);

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
        const num = Number(normalized);
        if (!isNaN(num)) return Boolean(num);
    }

    return false;
}
