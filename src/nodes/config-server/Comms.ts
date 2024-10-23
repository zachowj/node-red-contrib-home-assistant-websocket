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
    SlimHassDevice,
    SlimHassEntity,
    SlimHassEntityRegistryEntry,
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
        const slimDevices: SlimHassDevice[] = devices.map((device) => {
            return {
                area_id: device.area_id,
                id: device.id,
                labels: device.labels,
                name: device.name,
                name_by_user: device.name_by_user,
            };
        });

        this.publish('devices', slimDevices);
    }

    onFloorRegistryUpdate(floors: HassFloor[]): void {
        this.publish('floors', floors);
    }

    onLabelRegistryUpdate(labels: HassLabel[]): void {
        this.publish('labels', labels);
    }

    onEntityRegistryUpdate(entities: HassEntityRegistryEntry[]): void {
        const slimEntities: SlimHassEntityRegistryEntry[] = entities.map(
            (entity) => {
                return {
                    area_id: entity.area_id,
                    device_id: entity.device_id,
                    entity_id: entity.entity_id,
                    id: entity.id,
                    labels: entity.labels,
                    name: entity.name,
                    original_name: entity.original_name,
                    platform: entity.platform,
                };
            },
        );
        this.publish('entityRegistry', slimEntities);
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

    #stateChangedBatchedUpdates: Map<string, SlimHassEntity> = new Map();
    #throttledStateChangedPublish = throttle(() => {
        this.publish(
            'entity',
            Array.from(this.#stateChangedBatchedUpdates.values()),
            false,
        );
        this.#stateChangedBatchedUpdates.clear();
    }, 1000);

    onStateChanged(event: HassStateChangedEvent): void {
        const entity: SlimHassEntity = {
            entity_id: event.entity_id,
            state: event.event.new_state?.state as string,
            attributes: {
                device_class: event.event.new_state?.attributes.device_class,
                friendly_name: event.event.new_state?.attributes.friendly_name,
                supported_features:
                    event.event.new_state?.attributes.supported_features,
            },
        };
        if (!entity) return;
        this.#stateChangedBatchedUpdates.set(event.entity_id, entity);
        this.#throttledStateChangedPublish();
    }

    onStatesLoaded(entities: HassEntities): void {
        const slimEntities: { [entity_id: string]: SlimHassEntity } = {};
        Object.keys(entities).forEach((entityId) => {
            const entity = entities[entityId];
            slimEntities[entityId] = {
                entity_id: entityId,
                state: entity.state,
                attributes: {
                    device_class: entity.attributes.device_class,
                    friendly_name: entity.attributes.friendly_name,
                    supported_features: entity.attributes.supported_features,
                },
            };
        });
        this.publish('entities', slimEntities);
    }
}
