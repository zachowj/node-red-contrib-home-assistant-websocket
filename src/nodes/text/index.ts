import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import InputService, { NodeInputs } from '../../common/services/InputService';
import State from '../../common/State';
import Status from '../../common/status/Status';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import { getHomeAssistant, HaEvent } from '../../homeAssistant/index';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import TextController from './TextController';

export interface TextNodeProperties extends EntityBaseNodeProperties {
    state: string;
    stateType: string;
    outputProperties: OutputProperty[];
}

export interface TextNode extends BaseNode {
    config: TextNodeProperties;
}

export const inputs: NodeInputs = {
    state: {
        messageProp: 'payload.state',
        configProp: 'state',
        default: 'payload',
    },
    stateType: {
        messageProp: 'payload.stateType',
        configProp: 'stateType',
        default: TypedInputTypes.Message,
    },
};

export const inputSchema: Joi.ObjectSchema = Joi.object({
    state: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    stateType: Joi.string()
        .valid(
            TypedInputTypes.Message,
            TypedInputTypes.Flow,
            TypedInputTypes.Global,
            TypedInputTypes.JSONata,
            TypedInputTypes.Number
        )
        .required(),
});

export default function textNode(
    this: TextNode,
    config: EntityBaseNodeProperties
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const nodeEvents = new Events({ node: this, emitter: this });
    const state = new State(this);
    const status = new Status({
        config: serverConfigNode.config,
        nodeEvents,
        node: this,
        state,
    });

    const entityConfigEvents = new Events({
        node: this,
        emitter: entityConfigNode,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const inputService = new InputService<TextNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });

    entityConfigNode.integration.setStatus(status);
    const controller = new TextController({
        inputService,
        integration: entityConfigNode.integration,
        node: this,
        status,
        ...controllerDeps,
        state,
    });

    entityConfigEvents.addListener(
        HaEvent.StateChanged,
        controller.onValueChange.bind(controller)
    );
}
