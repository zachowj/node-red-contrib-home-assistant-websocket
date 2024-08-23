import { HassEntities, HassServices } from 'home-assistant-js-websocket';
import { throttle } from 'lodash';

import ClientEvents from '../../common/events/ClientEvents';
import { RED } from '../../globals';
import { HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import {
    HassArea,
    HassDevice,
    HassEntityRegistryEntry,
    HassFloor,
    HassLabel,
    HassStateChangedEvent,
} from '../../types/home-assistant';

export default class Comms {
    readonly #clientEvents: ClientEvents;
    readonly #homeAssistant: HomeAssistant;
    readonly #serverId: string;

    constructor(
        serverId: string,
        homeAssistant: HomeAssistant,
        clientEvents: ClientEvents,
    ) {
        this.#clientEvents = clientEvents;
        this.#homeAssistant = homeAssistant;
        this.#serverId = serverId;

        this.startListeners();
    }

    startListeners(): void {
        this.#clientEvents.addListeners(this, [
            ['ha_events:state_changed', this.onStateChanged],
            [ClientEvent.Integration, this.onIntegrationEvent],
            [ClientEvent.StatesLoaded, this.onStatesLoaded],
            [HaEvent.AreaRegistryUpdated, this.onAreaRegistryUpdate],
            [HaEvent.DeviceRegistryUpdated, this.onDeviceRegistryUpdate],
            [HaEvent.FloorRegistryUpdated, this.onFloorRegistryUpdate],
            [HaEvent.LabelRegistryUpdated, this.onLabelRegistryUpdate],
            [HaEvent.EntityRegistryUpdated, this.onEntityRegistryUpdate],
            [HaEvent.ServicesUpdated, this.onServicesUpdated],
        ]);
    }

    publish(type: string, data: { [key: string]: any }, retain = true): void {
        RED.comms.publish(
            `homeassistant/${type}/${this.#serverId}`,
            data,
            retain,
        );
    }

    onAreaRegistryUpdate(areas: HassArea[]): void {
        const throttledPublish = throttle(() => {
            this.publish('areas', areas);
        }, 1000);
        throttledPublish();
    }

    onDeviceRegistryUpdate(devices: HassDevice[]): void {
        const throttledPublish = throttle(() => {
            this.publish('devices', devices);
        }, 1000);
        throttledPublish();
    }

    onFloorRegistryUpdate(floors: HassFloor[]): void {
        const throttledPublish = throttle(() => {
            this.publish('floors', floors);
        }, 1000);
        throttledPublish();
    }

    onLabelRegistryUpdate(labels: HassLabel[]): void {
        const throttledPublish = throttle(() => {
            this.publish('labels', labels);
        }, 1000);
        throttledPublish();
    }

    onEntityRegistryUpdate(entities: HassEntityRegistryEntry[]): void {
        const throttledPublish = throttle(() => {
            this.publish('entityRegistry', entities);
        }, 1000);
        throttledPublish();
    }

    onIntegrationEvent(eventType: string): void {
        this.publish('integration', {
            event: eventType,
            version: this.#homeAssistant.integrationVersion,
        });
    }

    onServicesUpdated(services: HassServices): void {
        const throttledPublish = throttle(() => {
            this.publish('services', services);
        }, 1000);
        throttledPublish();
    }

    onStateChanged(event: HassStateChangedEvent): void {
        const entity = event.event.new_state;
        if (entity) {
            this.publish('entity', entity);
        }
    }

    onStatesLoaded(entities: HassEntities): void {
        const throttledPublish = throttle(() => {
            this.publish('entities', entities);
        }, 1000);
        throttledPublish();
    }
}
