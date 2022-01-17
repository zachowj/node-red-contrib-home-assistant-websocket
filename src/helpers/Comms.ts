import { HassEntities, HassServices } from 'home-assistant-js-websocket';

import {
    HA_EVENT_AREA_REGISTRY_UPDATED,
    HA_EVENT_DEVICE_REGISTRY_UPDATED,
} from '../const';
import { RED } from '../globals';
import HomeAssistant from '../homeAssistant/HomeAssistant';
import {
    HassAreas,
    HassDevices,
    HassStateChangedEvent,
} from '../types/home-assistant';

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
            'ha_client:services_loaded': this.onServicesLoaded,
            'ha_client:states_loaded': this.onStatesLoaded,
            'ha_events:state_changed': this.onStateChanged,
            integration: this.onIntegrationEvent,
            [HA_EVENT_AREA_REGISTRY_UPDATED]: this.onAreasUpdated,
            [HA_EVENT_DEVICE_REGISTRY_UPDATED]: this.onDevicesUpdated,
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

    onAreasUpdated(areas: HassAreas): void {
        this.publish('areas', areas);
    }

    onDevicesUpdated(devices: HassDevices): void {
        this.publish('devices', devices);
    }

    onIntegrationEvent(eventType: string): void {
        this.publish('integration', {
            event: eventType,
            version: this.homeAssistant.integrationVersion,
        });
    }

    onServicesLoaded(services: HassServices): void {
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
