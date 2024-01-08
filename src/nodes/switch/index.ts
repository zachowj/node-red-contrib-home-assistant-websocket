import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import BidirectionalIntegration from '../../common/integration/BidirectionalEntityIntegration';
import InputService, { NodeInputs } from '../../common/services/InputService';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import { getHomeAssistant, HaEvent } from '../../homeAssistant';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import SwitchController from './SwitchController';
import SwitchStatus from './SwitchStatus';

export interface SwitchNodeProperties extends EntityBaseNodeProperties {
    outputOnStateChange: boolean;
    outputProperties: OutputProperty[];
}

export interface SwitchNode extends BaseNode {
    config: SwitchNodeProperties;
    integration: BidirectionalIntegration;
}

const inputs: NodeInputs = {
    enable: {
        messageProp: 'enable',
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object();

export default function switchNode(
    this: SwitchNode,
    config: EntityBaseNodeProperties,
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const entityConfigEvents = new Events({
        node: this,
        emitter: entityConfigNode,
    });
    const status = new SwitchStatus({
        config: serverConfigNode.config,
        entityConfigEvents,
        entityConfigNode,
        node: this,
    });
    const inputService = new InputService<SwitchNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });

    entityConfigNode.integration.setStatus(status);
    const controller = new SwitchController({
        entityConfigEvents,
        entityConfigNode,
        inputService,
        node: this,
        status,
        ...createControllerDependencies(this, homeAssistant),
    });

    entityConfigEvents.addListeners(controller, [
        [HaEvent.AutomationTriggered, controller.onTrigger],
        [HaEvent.StateChanged, controller.onStateChange],
    ]);
}
