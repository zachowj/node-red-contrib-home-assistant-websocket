import { HassEntity } from 'home-assistant-js-websocket';

import {
    createCustomIdListByProperty,
    createSelect2Options,
    Select2Data,
} from '../../../editor/components/select2';
import * as haServer from '../../../editor/haserver';
import { byPropertiesOf } from '../../../helpers/sort';
import { HassArea, HassDevice } from '../../../types/home-assistant';
import { getNormalizedDomainServices } from './utils';

declare global {
    interface JQuery {
        maximizeSelect2Height: () => void;
    }
}

type ServiceTarget = {
    entity?: {
        domain?: string;
    };
};

export type Filter<T> = (value: T, index: number, array: T[]) => boolean;

const areaIdSelector = '#areaId';
const deviceIdSelector = '#deviceId';
const entityIdSelector = '#entityId';

const ValidTargetNone = 'none';
const ValidTargetAll = 'all';
const ValidTargetEntityOnly = 'entity_only';
export type ValidTargets =
    | typeof ValidTargetNone
    | typeof ValidTargetAll
    | typeof ValidTargetEntityOnly;

// Load entity list into select2
const populateEntities = ({
    selectedIds,
    filter,
}: {
    selectedIds?: string[];
    filter?: Filter<HassEntity>;
}) => {
    const $entityIdField = $(entityIdSelector);
    const entities = Object.values(haServer.getEntities());
    const entityIds = selectedIds ?? ($entityIdField.val() as string[]);
    $entityIdField.empty();
    const data = (filter ? entities.filter(filter) : entities)
        .map((e): Select2Data => {
            return {
                id: e.entity_id,
                text: e.attributes.friendly_name ?? e.entity_id,
                selected: entityIds.includes(e.entity_id),
                title: e.entity_id,
            };
        })
        .sort(byPropertiesOf<Select2Data>(['text']))
        .concat(
            createCustomIdListByProperty<HassEntity>(entityIds, entities, {
                property: 'entity_id',
                includeUnknownIds: true,
            })
        );
    $entityIdField
        .select2(
            createSelect2Options({
                data: data,
                multiple: true,
                tags: true,
                customTags: ['all'],
            })
        )
        .maximizeSelect2Height();
};

const populateAreas = ({
    selectedIds,
    filter,
}: {
    selectedIds?: string[];
    filter?: Filter<HassArea>;
}) => {
    const $areaId = $(areaIdSelector);
    const areas = haServer.getAreas();
    const areaIds = selectedIds ?? ($areaId.val() as string[]);
    $areaId.empty();
    const data = (filter ? areas.filter(filter) : areas)
        .map((a): Select2Data => {
            return {
                id: a.area_id,
                text: a.name,
                selected: areaIds.includes(a.area_id),
            };
        })
        .sort(byPropertiesOf<Select2Data>(['text']))
        .concat(
            createCustomIdListByProperty<HassArea>(areaIds, areas, {
                property: 'area_id',
                includeUnknownIds: true,
            })
        );
    $areaId
        .select2(
            createSelect2Options({ data: data, multiple: true, tags: true })
        )
        .maximizeSelect2Height();
};

const populateDevices = ({
    selectedIds,
    filter,
}: {
    selectedIds?: string[];
    filter?: Filter<HassDevice>;
}) => {
    const $deviceId = $(deviceIdSelector);
    const devices = haServer.getDevices();
    const deviceIds = selectedIds ?? ($deviceId.val() as string[]);
    $deviceId.empty();
    const data = (filter ? devices.filter(filter) : devices)
        .map((d): Select2Data => {
            return {
                id: d.id,
                text: d.name_by_user ?? d.name,
                selected: deviceIds.includes(d.id),
                title: haServer.getAreaNameById(d.area_id),
            };
        })
        .sort(byPropertiesOf<Select2Data>(['text']))
        .concat(
            createCustomIdListByProperty<HassDevice>(deviceIds, devices, {
                property: 'id',
                includeUnknownIds: true,
            })
        );
    $deviceId
        .select2(
            createSelect2Options({ data: data, multiple: true, tags: true })
        )
        .maximizeSelect2Height();
};

/*
 https://developers.home-assistant.io/docs/dev_101_services
 If the service accepts entity IDs, target allows the user to specify entities by 
 entity, device, or area. If `target` is specified, `entity_id` should not be defined 
 in the `fields` map. By default it shows only targets matching entities from the same 
 domain as the service, but if further customization is required, target supports the 
 entity, device, and area selectors (https://www.home-assistant.io/docs/blueprint/selectors/). 
 Entity selector parameters will automatically be applied to device and area, and 
 device selector parameters will automatically be applied to area.
 */
export const getValidTargets = (): ValidTargets => {
    const services = haServer.getServices();
    const [domain, service] = getNormalizedDomainServices();
    if (
        Object.keys(services).length === 0 ||
        !services?.[domain]?.[service] ||
        services?.[domain]?.[service]?.target !== undefined
    )
        return ValidTargetAll;

    if (services[domain]?.[service]?.fields.entity_id !== undefined)
        return ValidTargetEntityOnly;

    return ValidTargetNone;
};

// TODO: Check integration and device_class
const entitiesByServiceTarget = (): Filter<HassEntity> | undefined => {
    const services = haServer.getServices();
    const [domain, service] = getNormalizedDomainServices();
    const filterDomain = (
        services?.[domain]?.[service]?.target as ServiceTarget
    )?.entity?.domain;

    return filterDomain
        ? (value) => value.entity_id.startsWith(`${filterDomain}.`)
        : undefined;
};

// TODO: for devices check integration, manufacturer, model
const ByServiceTarget = (
    target: 'areas' | 'devices',
    targetId: 'id' | 'area_id'
) => {
    const targets = haServer.getTargetDomains()[target];
    const services = haServer.getServices();
    const [domain, service] = getNormalizedDomainServices();
    const filterDomain = (
        services?.[domain]?.[service]?.target as ServiceTarget
    )?.entity?.domain;

    return filterDomain
        ? (target) => targets[target[targetId]]?.includes(filterDomain)
        : undefined;
};

export const displayValidTargets = () => {
    const validTargets = getValidTargets();
    const $ids = $(
        `${areaIdSelector}, ${deviceIdSelector}, ${entityIdSelector}`
    );
    if (validTargets === ValidTargetNone) {
        $ids.parent().hide();
    } else {
        if (validTargets === ValidTargetEntityOnly) {
            $ids.parent().hide();
            $(entityIdSelector).parent().show();
        } else {
            $ids.parent().show();
        }
    }
};

export const populateTargets = ({
    areaId,
    deviceId,
    entityId,
}: {
    areaId?: string[];
    deviceId?: string[];
    entityId?: string[];
} = {}) => {
    const validTargets = getValidTargets();
    if (
        validTargets === ValidTargetAll ||
        validTargets === ValidTargetEntityOnly
    ) {
        if (validTargets === ValidTargetAll) {
            populateAreas({
                selectedIds: areaId,
                filter: ByServiceTarget('areas', 'area_id'),
            });
            populateDevices({
                selectedIds: deviceId,
                filter: ByServiceTarget('devices', 'id'),
            });
        } else {
            $(`${areaIdSelector}, ${deviceIdSelector}`)
                .val(null)
                .trigger('change');
        }
        populateEntities({
            selectedIds: entityId,
            filter: entitiesByServiceTarget(),
        });
    } else {
        // Clear all
        $(`${areaIdSelector}, ${deviceIdSelector}, ${entityIdSelector}`)
            .val(null)
            .trigger('change');
    }
};

export const getTarget = () => {
    return {
        areaId:
            $(areaIdSelector)
                .select2('data')
                ?.map((d) => d.id) ?? [],
        deviceId:
            $(deviceIdSelector)
                .select2('data')
                ?.map((d) => d.id) ?? [],
        entityId:
            $(entityIdSelector)
                .select2('data')
                ?.map((d) => d.id) ?? [],
    };
};
