import EventEmitter from 'events';

import { EventsList } from '../common/events/Events';
import { RED } from '../globals';
import { DeviceNode } from '../nodes/device';
import { BaseNode } from '../types/nodes';

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
    filter: string | string[],
    filterType: string
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
    const matches = jsonata.matchAll(regex);

    return new Set(Array.from(matches, (m) => m[1] as string));
}

export function addEventListeners(
    eventListeners: EventsList,
    emitter?: EventEmitter
): void {
    if (!emitter) return;

    eventListeners.forEach(([event, callback]) => {
        emitter.on(event, callback);
    });
}

export function removeEventListeners(
    eventListeners: EventsList,
    emitter?: EventEmitter
): void {
    if (!emitter) return;

    eventListeners.forEach(([event, callback]) => {
        emitter.off(event, callback);
    });
}

// https://github.com/home-assistant/core/blob/77ee72cbb9fed55779b0ee58443c3f41e5b35f5a/homeassistant/core.py#L125
export function validEntityId(entityId: string): boolean {
    return /^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)$/.test(
        entityId
    );
}

export function isNodeRedEnvVar(envVar: string) {
    // Check for ${env-var}
    return /^\$\{[a-zA-Z_][a-zA-Z0-9_]*\}$/.test(envVar);
}

export function checkValidServerConfig(
    node: BaseNode | DeviceNode,
    serverNodeId?: string
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
