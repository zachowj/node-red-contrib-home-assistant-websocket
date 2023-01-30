import { RED } from '../globals';
import Websocket from '../homeAssistant/Websocket';
import {
    HassAreas,
    HassDevices,
    HassEntityRegistryEntry,
} from '../types/home-assistant';

export function getAreaNameByEntityId(
    entityId: string,
    areas: HassAreas,
    devices: HassDevices,
    entities: HassEntityRegistryEntry[]
) {
    const areaId = getAreaIdByEntityId(entityId, areas, devices, entities);
    return getAreaNameByAreaId(areaId, areas);
}

function getAreaNameByAreaId(areaId: string | null, areas: HassAreas) {
    if (areaId && areas?.length) {
        const area = areas.find((a) => a.area_id === areaId);
        if (area) {
            return area.name;
        }
    }

    return RED._('ha-device.ui.no_area');
}

function getAreaIdByEntityId(
    entityId: string,
    areas: HassAreas,
    devices: HassDevices,
    entities: HassEntityRegistryEntry[]
) {
    const entity = getEntityById(entityId, entities);

    if (entity?.area_id) {
        return entity.area_id;
    }

    if (areas?.length) {
        const area = areas.find((area) => {
            const device = getDeviceByEntityId(entityId, devices, entities);
            return device?.area_id === area.area_id;
        });

        if (area) {
            return area.area_id;
        }
    }

    return null;
}

function getDeviceByEntityId(
    entityId: string,
    devices: HassDevices,
    entities: HassEntityRegistryEntry[]
) {
    const entity = getEntityById(entityId, entities);

    if (entity?.device_id && devices?.length) {
        const device = devices.find((device) => entity.device_id === device.id);
        if (device) {
            return device;
        }
    }

    return null;
}

function getEntityById(
    entityId: string,
    entities: HassEntityRegistryEntry[]
): HassEntityRegistryEntry | null {
    if (entityId && entities) {
        return entities.find((e) => e.entity_id === entityId) ?? null;
    }

    return null;
}

export function getRegistryData(HassWS: Websocket) {
    return {
        areas: HassWS.getAreas(),
        devices: HassWS.getDevices(),
        entities: HassWS.getEntities(),
    };
}
