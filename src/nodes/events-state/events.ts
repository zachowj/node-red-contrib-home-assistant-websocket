import ClientEvents from '../../common/events/ClientEvents';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { EventsStateNode } from '.';
import EventsStateController from './EventsStateController';

export function startListeners(
    controller: EventsStateController,
    homeAssistant: HomeAssistant,
    node: EventsStateNode,
    clientEvents: ClientEvents
) {
    let eventTopic = `ha_events:state_changed`;

    if (node.config.entityIdType === 'exact') {
        eventTopic =
            eventTopic = `ha_events:state_changed:${node.config.entityId}`;
    }

    clientEvents.addListener(
        eventTopic,
        controller.onHaEventsStateChanged.bind(controller)
    );

    if (node.config.outputInitially) {
        // Here for when the node is deploy without the server config being deployed
        if (homeAssistant.isHomeAssistantRunning) {
            controller.onDeploy();
        } else {
            clientEvents.addListener(
                'ha_client:initial_connection_ready',
                controller.onStatesLoaded.bind(controller)
            );
        }
    }
}
