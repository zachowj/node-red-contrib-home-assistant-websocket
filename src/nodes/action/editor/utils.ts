import { HassServices } from 'home-assistant-js-websocket';
import { VirtualSelectOption } from '../../../types/virtual-select';

export function getNormalizedDomainServices(): string[] {
    const action = $('#ha-action').val() as string;
    const [domain, service] = action.toLowerCase().split('.');

    return [domain, service];
}

export function buildDomainServices(serviceList: HassServices) {
    const domains = Object.keys(serviceList).sort();
    const domainServices = domains.reduce((acc, domain) => {
        const services = Object.keys(serviceList[domain]).sort();
        services.forEach((service) => {
            acc.push({
                value: `${domain}.${service}`,
                label: `${domain}.${service}`,
                description: serviceList[domain][service].description,
            });
        });
        return acc;
    }, [] as VirtualSelectOption[]);

    return domainServices;
}
