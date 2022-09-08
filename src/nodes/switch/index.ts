import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import BidirectionalIntegration from '../../common/integration/BidirectionalIntegration';
import InputService, { NodeInputs } from '../../common/services/InputService';
import State from '../../common/State';
import SwitchEntityStatus from '../../common/status/SwitchEntityStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import SwitchController from './SwitchController';

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
    config: EntityBaseNodeProperties
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const nodeEvents = new Events({ node: this, emitter: this });
    const entityConfigEvents = new Events({
        node: this,
        emitter: entityConfigNode,
    });
    const state = new State(this);
    const status = new SwitchEntityStatus({
        config: serverConfigNode.config,
        entityConfigEvents,
        entityConfigNode,
        nodeEvents,
        node: this,
        state,
    });
    const inputService = new InputService<SwitchNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });

    entityConfigNode.integration.setStatus(status);
    // eslint-disable-next-line no-new
    new SwitchController({
        entityConfigEvents,
        entityConfigNode,
        inputService,
        node: this,
        status,
        ...createControllerDependencies(this, homeAssistant),
    });
}
