import { IdSelectorType } from '../../common/const';
import { getErrorData } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import Status from '../../common/status/Status';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
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
    if (
        node.config.entities[IdSelectorType.Substring].length === 0 &&
        node.config.entities[IdSelectorType.Regex].length === 0
    ) {
        for (const entity of node.config.entities[IdSelectorType.Entity]) {
            const eventTopic = `ha_events:state_changed:${entity}`;
            clientEvents.addListener(
                eventTopic,
                controller.onHaEventsStateChanged.bind(controller),
            );
        }
    } else {
        clientEvents.addListener(
            'ha_events:state_changed',
            controller.onHaEventsStateChanged.bind(controller),
        );
    }

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
                ClientEvent.InitialConnectionReady,
                generateStateChanges,
            );
        }
    }
}
