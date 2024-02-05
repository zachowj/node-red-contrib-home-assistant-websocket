import { getErrorData } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import Status from '../../common/status/Status';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { EventsCalendarNode } from '.';
import EventsCalendarController from './EventsCalendarController';

export function startListeners(
    clientEvents: ClientEvents,
    controller: EventsCalendarController,
    homeAssistant: HomeAssistant,
    node: EventsCalendarNode,
    status: Status,
) {
    const queueUpcomingCalendarEvents = async () => {
        await controller.queueUpcomingCalendarEvents().catch((e) => {
            const { error, statusMessage } = getErrorData(e);
            status.setError(statusMessage);
            node.error(error);
        });
    };

    if (homeAssistant.isHomeAssistantRunning) {
        queueUpcomingCalendarEvents();
    } else {
        clientEvents.addListener(
            'ha_client:initial_connection_ready',
            queueUpcomingCalendarEvents,
        );
    }
}
