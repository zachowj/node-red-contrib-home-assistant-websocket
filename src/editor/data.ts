import {
    HassEntities,
    HassEntity,
    HassServices,
} from 'home-assistant-js-websocket';

import {
    HassArea,
    HassDevice,
    HassEntityRegistryEntry,
    HassFloor,
    HassLabel,
} from '../types/home-assistant';
import { i18n } from './i18n';
import { deepFind } from './utils';

const areas: { [serverId: string]: HassArea[] } = {};
const devices: { [serverId: string]: HassDevice[] } = {};
const entities: { [serverId: string]: HassEntities } = {};
const floors: { [serverId: string]: HassFloor[] } = {};
const labels: { [serverId: string]: HassLabel[] } = {};
const services: { [serverId: string]: HassServices } = {};
const entityRegistry: { [serverId: string]: HassEntityRegistryEntry[] } = {};

export function updateAreas(topic: string, data: HassArea[]): void {
    const serverId = parseServerId(topic);
    areas[serverId] = data;
}

export function updateDevices(topic: string, data: HassDevice[]): void {
    const serverId = parseServerId(topic);
    devices[serverId] = data;
}

export function updateEntity(topic: string, data: HassEntity): void {
    const serverId = parseServerId(topic);
    if (!entities[serverId]) entities[serverId] = {};
    entities[serverId][data.entity_id] = data;
}

export function updateEntityRegistry(
    topic: string,
    data: HassEntityRegistryEntry[],
): void {
    const serverId = parseServerId(topic);
    entityRegistry[serverId] = data;
}

export function updateEntities(topic: string, data: HassEntities): void {
    const serverId = parseServerId(topic);
    entities[serverId] = data;
}

export function updateFloors(topic: string, data: HassFloor[]): void {
    const serverId = parseServerId(topic);
    floors[serverId] = data;
}

export function updateLabels(topic: string, data: HassLabel[]): void {
    const serverId = parseServerId(topic);
    labels[serverId] = data;
}

export function updateServices(topic: string, data: HassServices): void {
    const serverId = parseServerId(topic);
    services[serverId] = data;
}

function parseServerId(topic: string) {
    const parts = topic.split('/');
    return parts[2];
}

export function getAutocomplete(serverId: string, type: any) {
    let list: string[] = [];
    switch (type) {
        case 'entities':
            if (!(serverId in entities)) return [];
            list = Object.keys(entities[serverId]).sort();
            break;
    }

    return list;
}

export type AutocompleteType =
    | 'entities'
    | 'properties'
    | 'trackers'
    | 'zones'
    | 'calendars';
export function getAutocompleteData(serverId: string, type: AutocompleteType) {
    let list: { value: any; label: any }[] = [];
    switch (type) {
        case 'entities': {
            if (!(serverId in entities)) return [];
            const path = 'attributes.friendly_name';
            list = Object.values(entities[serverId])
                .map((item) => {
                    return {
                        value: item.entity_id,
                        label: deepFind(path, item) || item.entity_id,
                    };
                })
                .sort(sortFriendlyName);
            break;
        }
        case 'properties': {
            if (!(serverId in entities)) return [];
            list = Object.values(entities[serverId])
                .map((item) => {
                    return {
                        value: item.entity_id,
                        label: item.state,
                    };
                })
                .sort(sortFriendlyName);
            break;
        }
        case 'trackers': {
            if (!(serverId in entities)) return [];
            const path = 'attributes.friendly_name';
            list = Object.values(entities[serverId])
                .filter(
                    (item) =>
                        item.entity_id.startsWith('person.') ||
                        item.entity_id.startsWith('device_tracker.'),
                )
                .map((item) => {
                    return {
                        value: item.entity_id,
                        label: deepFind(path, item) || item.entity_id,
                    };
                })
                .sort(sortFriendlyName);
            break;
        }
        case 'zones': {
            if (!(serverId in entities)) return [];
            const path = 'attributes.friendly_name';
            list = Object.values(entities[serverId])
                .filter((item) => item.entity_id.startsWith('zone.'))
                .map((item) => {
                    return {
                        value: item.entity_id,
                        label: deepFind(path, item) || item.entity_id,
                    };
                })
                .sort(sortFriendlyName);
            break;
        }
        case 'calendars': {
            if (!(serverId in entities)) return [];
            const path = 'attributes.friendly_name';
            list = Object.values(entities[serverId])
                .filter((item) => item.entity_id.startsWith('calendar.'))
                .map((item) => {
                    return {
                        value: item.entity_id,
                        label: deepFind(path, item) || item.entity_id,
                    };
                })
                .sort(sortFriendlyName);
            break;
        }
    }

    return list;
}

function sortFriendlyName(a: Record<string, any>, b: Record<string, any>) {
    const aName = a.label;
    const bName = b.label;
    if (aName === bName) return 0;

    return aName.localeCompare(bName);
}

export function getAreaNameById($serverId: string, areaId?: string) {
    const areas = getAreas($serverId);
    if (areaId && areas?.length) {
        const area = areas.find((a) => a.area_id === areaId);
        if (area) {
            return area.name;
        }
    }

    return i18n('ha-device.ui.no_area');
}

export function getAreas(serverId: string): HassArea[] {
    return areas[serverId] ?? [];
}

export function getDevices(serverId: string): HassDevice[] {
    return devices[serverId] ?? [];
}

export function getEntity(serverId: string, entityId: string): HassEntity {
    return entities[serverId][entityId];
}

export function getEntityFromRegistry(
    serverId: string,
    registryId: string,
): HassEntityRegistryEntry | undefined {
    return entityRegistry[serverId].find((entry) => entry.id === registryId);
}

export function getEntityRegistry(serverId: string): HassEntityRegistryEntry[] {
    return entityRegistry[serverId] ?? [];
}

export function getEntities(serverId: string): HassEntities {
    return entities[serverId] ?? {};
}

export function getFloors(serverId: string): HassFloor[] {
    return floors[serverId] ?? [];
}

export function getLabels(serverId: string): HassLabel[] {
    return labels[serverId] ?? [];
}

export function getProperties(serverId: string, entityId: string): string[] {
    if (!(serverId in entities)) return [];

    const flat =
        entityId in entities[serverId]
            ? Object.keys(flatten(entities[serverId][entityId]))
            : Object.values(entities[serverId]).map((entity) =>
                  Object.keys(flatten(entity)),
              );
    const uniqProperties = [
        ...new Set([].concat(...(flat as any))),
    ] as string[];
    const sortedProperties = uniqProperties.sort((a, b) => {
        if (!a.includes('.') && b.includes('.')) return -1;
        if (a.includes('.') && !b.includes('.')) return 1;
        if (a < b) return -1;
        if (a > b) return 1;

        return 0;
    });

    return sortedProperties;
}

export function getServices(serverId: string): HassServices {
    return services[serverId] ?? {};
}

function flatten(object: any, path?: string, separator = '.'): any {
    return Object.keys(object).reduce((acc, key) => {
        const value = object[key];
        const newPath = [path, key].filter(Boolean).join(separator);
        const isObject = [
            typeof value === 'object',
            value !== null,
            !(value instanceof Date),
            !(value instanceof RegExp),
            !(Array.isArray(value) && value.length === 0),
        ].every(Boolean);

        return isObject
            ? { ...acc, ...flatten(value, newPath, separator) }
            : { ...acc, [newPath]: value };
    }, {});
}
