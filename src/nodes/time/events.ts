import ClientEvents from '../../common/events/ClientEvents';
import { TypedInputTypes } from '../../const';
import { getEntitiesFromJsonata } from '../../helpers/utils';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { TimeNode } from '.';
import TimeController from './TimeController';

export function startListener(
    clientEvents: ClientEvents,
    controller: TimeController,
    homeAssistant: HomeAssistant,
    node: TimeNode,
) {
    clientEvents.addListener(
        ClientEvent.Ready,
        controller.handleEvent.bind(controller),
    );

    clientEvents.addListener(
        `ha_events:state_changed:${node.config.entityId}`,
        controller.handleEvent.bind(controller),
    );

    if (
        node.config.offsetType === TypedInputTypes.JSONata &&
        node.config.offset.length > 12
    ) {
        const ids = getEntitiesFromJsonata(node.config.offset);
        ids.forEach((id) => {
            clientEvents.addListener(
                `ha_events:state_changed:${id}`,
                controller.handleEvent.bind(controller),
            );
        });
    }

    if (homeAssistant.isHomeAssistantRunning) {
        clientEvents.emit(`ha_events:state_changed:${node.config.entityId}`);
    }
}
