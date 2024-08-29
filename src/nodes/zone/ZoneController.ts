import { cloneDeep } from 'lodash';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import { HassEntity, HassStateChangedEvent } from '../../types/home-assistant';
import { ZoneNode } from '.';
import { getLocationData, getZoneData, inZone } from './helpers';

export type locationData = {
    latitude: number;
    longitude: number;
    radius?: number;
};

enum ZoneEvent {
    Enter = 'enter',
    EnterOrLeave = 'enter_leave',
    Leave = 'leave',
}

const ExposeAsController = ExposeAsMixin(OutputController<ZoneNode>);
export default class Zone extends ExposeAsController {
    #getValidZones(fromState: HassEntity, toState: HassEntity) {
        const config = this.node.config;
        const fromLocationData = getLocationData(fromState);
        const toLocationData = getLocationData(toState);
        if (!fromLocationData || !toLocationData) return [];
        const zones = this.#getZones();
        const validZones = zones.filter((zone) => {
            const zoneData = getZoneData(zone);
            if (!zoneData) return false;
            const fromMatch = inZone(fromLocationData, zoneData);
            const toMatch = inZone(toLocationData, zoneData);

            return (
                (config.event === ZoneEvent.Enter && !fromMatch && toMatch) ||
                (config.event === ZoneEvent.Leave && fromMatch && !toMatch) ||
                (config.event === ZoneEvent.EnterOrLeave &&
                    fromMatch !== toMatch)
            );
        });

        return validZones;
    }

    #getZones() {
        const entities = this.homeAssistant.websocket.getStates();
        const zones: HassEntity[] = [];
        for (const entityId in entities) {
            if (this.node.config.zones.includes(entityId)) {
                zones.push(entities[entityId] as HassEntity);
            }
        }

        return zones;
    }

    public onStateChanged(evt: HassStateChangedEvent) {
        if (this.isEnabled === false) {
            return;
        }

        const { entity_id: entityId, event } = cloneDeep(evt);

        if (!event.old_state || !event.new_state) return;

        const zones = this.#getValidZones(event.old_state, event.new_state);

        if (!zones.length) return;

        if (event.new_state) {
            event.new_state.timeSinceChangedMs =
                Date.now() - new Date(event.new_state.last_changed).getTime();
        }

        const msg = {
            topic: entityId,
            payload: event.new_state.state,
            data: event,
            zones,
        };
        const statusMessage = `${entityId} ${this.node.config.event} ${zones
            .map((z) => z.entity_id)
            .join(',')}`;

        this.status.setSuccess(statusMessage);
        this.node.send(msg);
    }
}
