import * as haServer from '../../../editor/haserver';
import { containsMustache } from '../../../helpers/utils';
import { getNormalizedDomainServices } from './utils';

// type ServiceTarget = {
//     entity?: {
//         domain?: string;
//     };
// };

export type Filter<T> = (value: T, index: number, array: T[]) => boolean;

const floorIdSelector = '#floor-list';
const areaIdSelector = '#area-list';
const deviceIdSelector = '#device-list';
const entityIdSelector = '#entity-list';
const labelIdSelector = '#label-list';
const idSelectors = [
    floorIdSelector,
    areaIdSelector,
    deviceIdSelector,
    entityIdSelector,
    labelIdSelector,
];

const ValidTargetNone = 'none';
const ValidTargetAll = 'all';
const ValidTargetEntityOnly = 'entity_only';
export type ValidTargets =
    | typeof ValidTargetNone
    | typeof ValidTargetAll
    | typeof ValidTargetEntityOnly;

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
export function getValidTargets(action: string): ValidTargets {
    if (containsMustache(action)) {
        return ValidTargetAll;
    }

    const services = haServer.getServices();
    const [domain, service] = getNormalizedDomainServices();
    if (
        Object.keys(services).length === 0 ||
        !services?.[domain]?.[service] ||
        services?.[domain]?.[service]?.target !== undefined
    )
        return ValidTargetAll;

    return ValidTargetNone;
}

// TODO: Check integration and device_class
// function entitiesByServiceTarget(): Filter<HassEntity> | undefined {
//     const services = haServer.getServices();
//     const [domain, service] = getNormalizedDomainServices();
//     const filterDomain = (
//         services?.[domain]?.[service]?.target as ServiceTarget
//     )?.entity?.domain;

//     return filterDomain
//         ? (value) => value.entity_id.startsWith(`${filterDomain}.`)
//         : undefined;
// }

// TODO: for devices check integration, manufacturer, model
// function ByServiceTarget(
//     target: 'areas' | 'devices',
//     targetId: 'id' | 'area_id',
// ) {
//     const targets = haServer.getTargetDomains()[target];
//     const services = haServer.getServices();
//     const [domain, service] = getNormalizedDomainServices();
//     const filterDomain = (
//         services?.[domain]?.[service]?.target as ServiceTarget
//     )?.entity?.domain;

//     return filterDomain
//         ? (target) => targets[target[targetId]]?.includes(filterDomain)
//         : undefined;
// }

export function displayValidTargets(action: string) {
    const validTargets = getValidTargets(action);
    const $ids = $(idSelectors.join(', '));
    const $formRow = $ids.parents('.form-row');
    $formRow.toggle(validTargets !== ValidTargetNone);
}
