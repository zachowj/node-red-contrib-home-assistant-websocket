import ClientEvents from '../../common/events/ClientEvents';
import { HA_CLIENT_READY, HA_EVENTS, TypedInputTypes } from '../../const';
import { getEntitiesFromJsonata } from '../../helpers/utils';
import { HaEvent } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { PollStateNodeProperties } from '.';
import PollStateController from './PollStateController';

export function startListeners({
    config,
    clientEvents,
    controller,
    homeAssistant,
}: {
    config: PollStateNodeProperties;
    clientEvents: ClientEvents;
    controller: PollStateController;
    homeAssistant: HomeAssistant;
}) {
    if (config.outputOnChanged) {
        clientEvents.addListener(
            `${HA_EVENTS}:${HaEvent.StateChanged}:${config.entityId}`,
            controller.onTimer.bind(controller)
        );
    }

    if (config.outputInitially) {
        if (homeAssistant.isHomeAssistantRunning) {
            controller.onTimer();
        } else {
            clientEvents.addListener(
                'ha_client:initial_connection_ready',
                controller.onTimer.bind(controller)
            );
        }
    }

    if (homeAssistant.isHomeAssistantRunning) {
        controller.onIntervalUpdate();
    } else {
        clientEvents.addListener(
            HA_CLIENT_READY,
            controller.onIntervalUpdate.bind(controller)
        );
    }

    if (
        config.updateIntervalType === TypedInputTypes.JSONata &&
        config.updateInterval.length > 12
    ) {
        const ids = getEntitiesFromJsonata(config.updateInterval);
        ids.forEach((id) => {
            clientEvents.addListener(
                `${HA_EVENTS}:${HaEvent.StateChanged}:${id}`,
                controller.onIntervalUpdate.bind(controller)
            );
        });
    }
}
