import { HassEntities, HassServices } from 'home-assistant-js-websocket';

import { EventsList } from '../../common/events/Events';
import { RED } from '../../globals';
import { HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
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
        const events: EventsList = [
            [HaEvent.ServicesUpdated, this.onServicesUpdated],
            [ClientEvent.ServicesLoaded, this.onStatesLoaded],
            [HaEvent.StateChanged, this.onStateChanged],
            [HaEvent.Integration, this.onIntegrationEvent],
            [HaEvent.AreaRegistryUpdated, this.onAreaRegistryUpdate],
            [HaEvent.DeviceRegistryUpdated, this.onDeviceRegistryUpdate],
            [HaEvent.RegistryUpdated, this.onRegistryUpdate],
        ];

        events.forEach(([event, callback]) =>
            this.homeAssistant.addListener(String(event), callback.bind(this))
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
