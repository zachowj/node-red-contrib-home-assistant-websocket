import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';

import { CalendarEventType } from './const';
import ClientEvents from '../../common/events/ClientEvents';
import EventsCalendarController from './EventsCalendarController';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { TypedInputTypes } from '../../const';
import { createControllerDependencies } from '../../common/controllers/helpers';
import { getHomeAssistant } from '../../homeAssistant';
import { migrate } from '../../helpers/migrate';
import { startListeners } from './events';

export interface EventsCalendarNodeProperties extends BaseNodeProperties {
    exposeAsEntityConfig: string;
    entityId: string;
    filter?: string;
    filterType: TypedInputTypes;
    eventType: CalendarEventType;
    offset: string;
    offsetType: TypedInputTypes;
    offsetUnits: string;
    outputProperties: OutputProperty[];
}

export interface EventsCalendarNode extends BaseNode {
    config: EventsCalendarNodeProperties;
}

export default function eventsCalendarNode(
    this: EventsCalendarNode,
    config: EventsCalendarNodeProperties,
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const exposeAsConfigNode = getExposeAsConfigNode(
        this.config.exposeAsEntityConfig,
    );
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });

    const status = new EventsStatus({
        clientEvents,
        config: serverConfigNode.config,
        exposeAsEntityConfigNode: exposeAsConfigNode,
        node: this,
    });
    clientEvents.setStatus(status);
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    const controller = new EventsCalendarController({
        node: this,
        status,
        ...controllerDeps,
    });
    controller.setExposeAsConfigNode(exposeAsConfigNode);

    startListeners(clientEvents, controller, homeAssistant);
}
