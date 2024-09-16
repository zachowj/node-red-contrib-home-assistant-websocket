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
    HassEntity,
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
        this.publish('areas', areas);
    }

    onDeviceRegistryUpdate(devices: HassDevice[]): void {
        this.publish('devices', devices);
    }

    onFloorRegistryUpdate(floors: HassFloor[]): void {
        this.publish('floors', floors);
    }

    onLabelRegistryUpdate(labels: HassLabel[]): void {
        this.publish('labels', labels);
    }

    onEntityRegistryUpdate(entities: HassEntityRegistryEntry[]): void {
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

    #stateChangedBatchedUpdates: Map<string, HassEntity> = new Map();
    #throttledStateChangedPublish = throttle(() => {
        this.publish(
            'entity',
            Array.from(this.#stateChangedBatchedUpdates.values()),
        );
        this.#stateChangedBatchedUpdates.clear();
    }, 1000);

    onStateChanged(event: HassStateChangedEvent): void {
        const entity = event.event.new_state;
        if (!entity) return;
        this.#stateChangedBatchedUpdates.set(event.entity_id, entity);
        this.#throttledStateChangedPublish();
    }

    onStatesLoaded(entities: HassEntities): void {
        this.publish('entities', entities);
    }
}
