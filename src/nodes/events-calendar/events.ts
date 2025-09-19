import ClientEvents from '../../common/events/ClientEvents';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import EventsCalendarController from './EventsCalendarController';

export function startListeners(
    clientEvents: ClientEvents,
    controller: EventsCalendarController,
    homeAssistant: HomeAssistant,
) {
    if (homeAssistant.isHomeAssistantRunning) {
        controller.startPolling();
    } else {
        clientEvents.addListener(
            ClientEvent.InitialConnectionReady,
            controller.startPolling.bind(controller),
        );
    }
}
