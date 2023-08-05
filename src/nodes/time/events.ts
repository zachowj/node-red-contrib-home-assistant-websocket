import BaseError from '../../common/errors/BaseError';
import ClientEvents from '../../common/events/ClientEvents';
import Status from '../../common/status/Status';
import { TypedInputTypes } from '../../const';
import { getEntitiesFromJsonata } from '../../helpers/utils';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { TimeNode } from '.';
import TimeController from './TimeController';

export function startListener(
    clientEvents: ClientEvents,
    controller: TimeController,
    homeAssistant: HomeAssistant,
    node: TimeNode,
    status: Status
) {
    if (homeAssistant.isHomeAssistantRunning) {
        try {
            controller.onStateChanged();
        } catch (e) {
            if (e instanceof BaseError) {
                status.setError(e.message);
            }
            throw e;
        }
    }
    clientEvents.addListener(
        'ha_client:ready',
        controller.onStateChanged.bind(controller)
    );

    clientEvents.addListener(
        `ha_events:state_changed:${node.config.entityId}`,
        controller.onStateChanged.bind(controller)
    );

    if (
        node.config.offsetType === TypedInputTypes.JSONata &&
        node.config.offset.length > 12
    ) {
        const ids = getEntitiesFromJsonata(node.config.offset);
        ids.forEach((id) => {
            clientEvents.addListener(
                `ha_events:state_changed:${id}`,
                controller.onStateChanged.bind(controller)
            );
        });
    }
}
