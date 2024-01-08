import { getErrorData } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import Status from '../../common/status/Status';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { createStateChangeEvents } from '../trigger-state/helpers';
import { EventsStateNode } from '.';
import EventsStateController from './EventsStateController';

export function startListeners(
    clientEvents: ClientEvents,
    controller: EventsStateController,
    homeAssistant: HomeAssistant,
    node: EventsStateNode,
    status: Status,
) {
    let eventTopic = `ha_events:state_changed`;

    if (node.config.entityIdType === 'exact') {
        eventTopic =
            eventTopic = `ha_events:state_changed:${node.config.entityId}`;
    }

    clientEvents.addListener(
        eventTopic,
        controller.onHaEventsStateChanged.bind(controller),
    );

    if (node.config.outputInitially) {
        const generateStateChanges = async () => {
            const events = createStateChangeEvents(homeAssistant);
            for (const event of events) {
                await controller
                    .onHaEventsStateChanged(event, true)
                    .catch((e) => {
                        const { error, statusMessage } = getErrorData(e);
                        status.setError(statusMessage);
                        node.error(error);
                    });
            }
        };
        // Here for when the node is deploy without the server config being deployed
        if (homeAssistant.isHomeAssistantRunning) {
            generateStateChanges();
        } else {
            clientEvents.addListener(
                'ha_client:initial_connection_ready',
                generateStateChanges,
            );
        }
    }
}
