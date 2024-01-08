import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import { startListeners } from './events';
import EventsAllController from './EventsAllController';
import { validateConfig } from './validate';

export interface EventsAllNodeProperties extends BaseNodeProperties {
    eventType: string;
    eventData: string;
    waitForRunning: boolean;
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

export interface EventsAllNode extends BaseNode {
    config: EventsAllNodeProperties;
}

export const HA_CLIENT = 'home_assistant_client';

export default function eventsAllNode(
    this: EventsAllNode,
    config: EventsAllNodeProperties,
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    validateConfig(this.config);

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

    const controller = new EventsAllController({
        node: this,
        status,
        ...controllerDeps,
    });
    controller.setExposeAsConfigNode(exposeAsConfigNode);

    startListeners(clientEvents, controller, homeAssistant, this);
}
