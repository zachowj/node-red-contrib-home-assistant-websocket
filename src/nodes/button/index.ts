import { createControllerDependencies } from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import Status from '../../common/status/Status';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import { getHomeAssistant, HaEvent } from '../../homeAssistant/index';
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
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const entityConfigEvents = new Events({
        node: this,
        emitter: entityConfigNode,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    entityConfigNode.integration.setStatus(status);
    const controller = new ButtonController({
        node: this,
        status,
        ...controllerDeps,
    });

    entityConfigEvents.addListener(
        HaEvent.AutomationTriggered,
        controller.onTrigger.bind(controller)
    );
}
