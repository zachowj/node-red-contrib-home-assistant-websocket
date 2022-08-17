import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import ButtonController from './ButtonController';

export interface ButtonNodeProperties extends EntityBaseNodeProperties {
    outputProperties: OutputProperty[];
}

export interface ButtonNode extends BaseNode {
    config: ButtonNodeProperties;
}

export default function buttonNode(
    this: ButtonNode,
    config: EntityBaseNodeProperties
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = serverConfigNode.getHomeAssistant();
    const clientEvents = new ClientEvents({ node: this, homeAssistant });
    const status = new EventsStatus(
        this,
        serverConfigNode.config,
        clientEvents
    );
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const entityEvents = new Events({
        node: this,
        emitter: entityConfigNode.controller,
    });
    // eslint-disable-next-line no-new
    new ButtonController({
        entityEvents,
        node: this,
        status,
        ...controllerDeps,
    });
}
