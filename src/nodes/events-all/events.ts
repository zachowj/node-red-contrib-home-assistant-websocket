import ClientEvents from '../../common/events/ClientEvents';
import { EventsList, NodeEvent } from '../../common/events/Events';
import { HA_EVENTS } from '../../const';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { NodeDone } from '../../types/nodes';
import { EventsAllNode, HA_CLIENT } from '.';
import EventsAllController from './EventsAllController';

export function startListeners(
    clientEvents: ClientEvents,
    controller: EventsAllController,
    homeAssistant: HomeAssistant,
    node: EventsAllNode,
) {
    const config = node.config;

    clientEvents.addListener(
        `${HA_EVENTS}:${config.eventType || 'all'}`,
        controller.onHaEventsAll.bind(controller),
    );

    if (config.eventType === '' || config.eventType === HA_CLIENT) {
        const list: EventsList = [
            [ClientEvent.StatesLoaded, controller.onClientStatesLoaded],
            [ClientEvent.ServicesLoaded, controller.onClientServicesLoaded],
            [ClientEvent.Running, controller.onHaEventsRunning],
            [ClientEvent.Ready, controller.onHaEventsReady],
        ];

        list.forEach(([event, callback]) => {
            clientEvents.addListener(event, callback.bind(controller));
        });
    }

    const updateEventList = () => {
        if (homeAssistant.isConnected) {
            homeAssistant.subscribeEvents();
        }
    };

    // Registering only needed event types
    if (homeAssistant) {
        homeAssistant.eventsList[node.id] = config.eventType || '__ALL__';
        updateEventList();
    }

    node.addListener(NodeEvent.Close, (removed: boolean, done: NodeDone) => {
        if (removed) {
            delete homeAssistant.eventsList[node.id];
            updateEventList();
        }
        done();
    });
}
