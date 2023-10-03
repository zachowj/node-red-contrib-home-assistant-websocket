import { HassEntities } from 'home-assistant-js-websocket';

import { HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';

export function createStateChangeEvents(
    homeAssistant: HomeAssistant,
    entities?: HassEntities
) {
    entities ??= homeAssistant.websocket.getStates();

    const events = [];
    for (const entityId in entities) {
        events.push({
            event_type: HaEvent.StateChanged,
            entity_id: entityId,
            event: {
                entity_id: entityId,
                old_state: entities[entityId],
                new_state: entities[entityId],
            },
        });
    }

    return events;
}
