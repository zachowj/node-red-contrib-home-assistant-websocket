import { HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { HassStateChangedEvent } from '../../types/home-assistant';

export function createStateChangeEvents(homeAssistant: HomeAssistant) {
    const entities = homeAssistant.websocket.getStates();

    const events: HassStateChangedEvent[] = [];
    for (const entityId in entities) {
        events.push({
            event_type: HaEvent.StateChanged,
            entity_id: entityId,
            event: {
                entity_id: entityId,
                old_state: entities[entityId],
                new_state: entities[entityId],
            },
        } as HassStateChangedEvent);
    }

    return events;
}
