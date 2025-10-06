import { getErrorData } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import Status from '../../common/status/Status';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { EventsCalendarNode } from '.';
import EventsCalendarController from './EventsCalendarController';

export async function startListeners(
    clientEvents: ClientEvents,
    controller: EventsCalendarController,
    homeAssistant: HomeAssistant,
    node: EventsCalendarNode,
    status: Status,
) {
    if (homeAssistant.isHomeAssistantRunning) {
        await controller.startPolling().catch((e) => {
            const { error, statusMessage } = getErrorData(e);
            status.setError(statusMessage);
            node.error(error);
        });
    } else {
        clientEvents.addListener(
            ClientEvent.InitialConnectionReady,
            controller.startPolling.bind(controller),
        );
    }
}
