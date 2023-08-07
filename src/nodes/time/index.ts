import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant/index';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import { startListener } from './events';
import TimeController from './TimeController';

export interface TimeNodeProperties extends BaseNodeProperties {
    entityId: string;
    property: string;
    offset: string;
    offsetType: string;
    offsetUnits: string;
    randomOffset: boolean;
    repeatDaily: boolean;
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

export interface TimeNode extends BaseNode {
    config: TimeNodeProperties;
}

export default function timeNode(this: TimeNode, config: TimeNodeProperties) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const exposeAsConfigNode = getExposeAsConfigNode(
        this.config.exposeAsEntityConfig
    );
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    const status = new EventsStatus({
        clientEvents,
        exposeAsEntityConfigNode: exposeAsConfigNode,
        config: serverConfigNode.config,
        node: this,
    });
    clientEvents.setStatus(status);

    const controllerDeps = createControllerDependencies(this, homeAssistant);

    const controller = new TimeController({
        exposeAsConfigNode,
        node: this,
        status,
        ...controllerDeps,
    });

    startListener(clientEvents, controller, homeAssistant, this, status);
}
