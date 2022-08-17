import { HassEntities, HassServices } from 'home-assistant-js-websocket';

import {
    HA_EVENT_AREA_REGISTRY_UPDATED,
    HA_EVENT_DEVICE_REGISTRY_UPDATED,
    HA_EVENT_REGISTRY_UPDATED,
    HA_EVENT_SERVICES_UPDATED,
} from '../../const';
import { RED } from '../../globals';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import {
    HassAreas,
    HassDevices,
    HassEntityRegistryEntry,
    HassStateChangedEvent,
} from '../../types/home-assistant';

const convertSetToArray = (obj: { [key: string]: Set<string> }) => {
    const result: { [key: string]: string[] } = {};
    Object.keys(obj).forEach((key) => {
        result[key] = Array.from(obj[key]);
    });
    return result;
};

export default class Comms {
    constructor(
        private readonly homeAssistant: HomeAssistant,
        private readonly serverId: string
    ) {
        this.startListeners();
    }

    startListeners(): void {
        // Setup event listeners
        const events: { [key: string]: (data?: any) => void } = {
            [HA_EVENT_SERVICES_UPDATED]: this.onServicesUpdated,
            'ha_client:states_loaded': this.onStatesLoaded,
            'ha_events:state_changed': this.onStateChanged,
            integration: this.onIntegrationEvent,
            [HA_EVENT_AREA_REGISTRY_UPDATED]: this.onAreaRegistryUpdate,
            [HA_EVENT_DEVICE_REGISTRY_UPDATED]: this.onDeviceRegistryUpdate,
            [HA_EVENT_REGISTRY_UPDATED]: this.onRegistryUpdate,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.homeAssistant.addListener(event, callback.bind(this))
        );
    }

    publish(type: string, data: { [key: string]: any }, retain = true): void {
        RED.comms.publish(
            `homeassistant/${type}/${this.serverId}`,
            data,
            retain
        );
    }

    onAreaRegistryUpdate(areas: HassAreas): void {
        this.publish('areas', areas);
    }

    onDeviceRegistryUpdate(devices: HassDevices): void {
        this.publish('devices', devices);
    }

    onRegistryUpdate({
        devices,
        entities,
    }: {
        areas: HassAreas;
        devices: HassDevices;
        entities: HassEntityRegistryEntry[];
    }): void {
        const areaDomains: { [key: string]: Set<string> } = {};
        const deviceDomains: { [key: string]: Set<string> } = {};
        entities.forEach((entity) => {
            if (entity.area_id) {
                if (!(entity.area_id in areaDomains)) {
                    areaDomains[entity.area_id] = new Set<string>();
                }
                areaDomains[entity.area_id].add(entity.entity_id.split('.')[0]);
            }
            if (entity.device_id) {
                if (!(entity.device_id in deviceDomains)) {
                    deviceDomains[entity.device_id] = new Set<string>();
                }
                deviceDomains[entity.device_id].add(
                    entity.entity_id.split('.')[0]
                );
            }
        });

        devices.forEach((device) => {
            if (device.area_id) {
                if (!(device.area_id in areaDomains)) {
                    areaDomains[device.area_id] = new Set<string>();
                }
                areaDomains[device.area_id] = new Set([
                    ...areaDomains[device.area_id],
                    ...(deviceDomains[device.id] ?? []),
                ]);
            }
        });

        this.publish('targetDomains', {
            areas: convertSetToArray(areaDomains),
            devices: convertSetToArray(deviceDomains),
        });
    }

    onIntegrationEvent(eventType: string): void {
        this.publish('integration', {
            event: eventType,
            version: this.homeAssistant.integrationVersion,
        });
    }

    onServicesUpdated(services: HassServices): void {
        this.publish('services', services);
    }

    onStateChanged(event: HassStateChangedEvent): void {
        const entity = event.event.new_state;
        if (entity) {
            this.publish('entity', entity);
        }
    }

    onStatesLoaded(entities: HassEntities): void {
        this.publish('entities', entities);
    }
}
