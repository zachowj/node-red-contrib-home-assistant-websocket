import { HassEntities, HassServices } from 'home-assistant-js-websocket';

import ClientEvents from '../../common/events/ClientEvents';
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
            [HaEvent.RegistryUpdated, this.onRegistryUpdate],
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

    onAreaRegistryUpdate(areas: HassAreas): void {
        this.publish('areas', areas);
    }

    onDeviceRegistryUpdate(devices: HassDevices): void {
        this.publish('devices', devices);
    }

    onFloorRegistryUpdate(floors: { [key: string]: string }): void {
        this.publish('floors', floors);
    }

    onLabelRegistryUpdate(labels: { [key: string]: string }): void {
        this.publish('labels', labels);
    }

    onRegistryUpdate({
        entities,
    }: {
        entities: HassEntityRegistryEntry[];
    }): void {
        this.publish('entityRegistry', entities);
    }

    onIntegrationEvent(eventType: string): void {
        this.publish('integration', {
            event: eventType,
            version: this.#homeAssistant.integrationVersion,
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
