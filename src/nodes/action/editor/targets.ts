import * as haServer from '../../../editor/haserver';
import { containsMustache } from '../../../helpers/utils';
import { getNormalizedDomainServices } from './utils';

type ServiceEntityFilter = {
    integration?: string;
    domain?: string | string[];
    device_class?: string | string[];
    supported_features?: number | [number];
};

type ServiceFilter = {
    entity?: ServiceEntityFilter | ServiceEntityFilter[];
};

export type ActionTargetFilter = {
    integration?: string;
    domain?: string[];
    device_class?: string[];
    supported_features?: number;
};

export enum ValidTarget {
    All = 'all',
    None = 'none',
}

export function convertServiceEntityFilter(
    filter: ServiceEntityFilter,
): ActionTargetFilter {
    return {
        integration: filter.integration,
        domain: Array.isArray(filter.domain)
            ? filter.domain
            : filter.domain
              ? [filter.domain]
              : undefined,
        device_class: Array.isArray(filter.device_class)
            ? filter.device_class
            : filter.device_class
              ? [filter.device_class]
              : undefined,
        supported_features: Array.isArray(filter.supported_features)
            ? filter.supported_features[0]
            : filter.supported_features,
    };
}

export function getActionTargetFilter(
    filter: ServiceFilter,
): ActionTargetFilter[] {
    if (!filter.entity) return [];

    return Array.isArray(filter.entity)
        ? filter.entity.map(convertServiceEntityFilter)
        : [convertServiceEntityFilter(filter.entity)];
}

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
export function getValidTargets(action: string): ValidTarget {
    if (containsMustache(action)) {
        return ValidTarget.All;
    }

    const services = haServer.getServices();
    const [domain, service] = getNormalizedDomainServices();
    if (
        Object.keys(services).length === 0 ||
        !services?.[domain]?.[service] ||
        services?.[domain]?.[service]?.target !== undefined
    )
        return ValidTarget.All;

    return ValidTarget.None;
}

export function getTargetFilters(): ActionTargetFilter[] {
    const services = haServer.getServices();
    const [domain, service] = getNormalizedDomainServices();
    const filter = services?.[domain]?.[service]?.target as ServiceFilter;

    return filter ? getActionTargetFilter(filter) : [];
}
