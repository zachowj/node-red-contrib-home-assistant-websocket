import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import {
    DeepReadonly,
    HassEntity,
    HassStateChangedEvent,
} from '../../types/home-assistant';
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
    #getValidZones(
        fromState: DeepReadonly<HassEntity>,
        toState: DeepReadonly<HassEntity>,
    ) {
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
        const zones: DeepReadonly<HassEntity>[] = [];
        for (const entityId in entities) {
            if (this.node.config.zones.includes(entityId)) {
                zones.push(entities[entityId]);
            }
        }

        return zones;
    }

    public onStateChanged(evt: DeepReadonly<HassStateChangedEvent>) {
        if (this.isEnabled === false) {
            return;
        }

        const { entity_id: entityId, event } = evt;

        if (!event.old_state || !event.new_state) return;

        const zones = this.#getValidZones(event.old_state, event.new_state);

        if (!zones.length) return;

        // Message goes to the user, so it gets its own copy of the readonly data
        const msg = {
            topic: entityId,
            payload: event.new_state.state,
            data: structuredClone(event),
            zones: structuredClone(zones),
        };
        const statusMessage = `${entityId} ${this.node.config.event} ${zones
            .map((z) => z.entity_id)
            .join(',')}`;

        this.status.setSuccess(statusMessage);
        this.node.send(msg);
    }
}
