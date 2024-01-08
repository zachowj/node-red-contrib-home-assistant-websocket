import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import { IntegrationEvent } from '../../common/integration/Integration';
import InputService, { NodeInputs } from '../../common/services/InputService';
import Status from '../../common/status/Status';
import { TypedInputTypes, ValueIntegrationMode } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant/index';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import NumberController from './NumberController';

export interface NumberNodeProperties extends EntityBaseNodeProperties {
    mode: ValueIntegrationMode;
    value: string;
    valueType: string;
    outputProperties: OutputProperty[];
}

export interface NumberNode extends BaseNode {
    config: NumberNodeProperties;
}

export const inputs: NodeInputs = {
    value: {
        messageProp: 'payload.value',
        configProp: 'value',
        default: 'payload',
    },
    valueType: {
        messageProp: 'payload.valueType',
        configProp: 'valueType',
        default: TypedInputTypes.Message,
    },
};

export const inputSchema: Joi.ObjectSchema = Joi.object({
    value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    valueType: Joi.string()
        .valid(
            TypedInputTypes.Message,
            TypedInputTypes.Flow,
            TypedInputTypes.Global,
            TypedInputTypes.JSONata,
            TypedInputTypes.Number,
        )
        .required(),
});

export default function numberNode(
    this: NumberNode,
    config: NumberNodeProperties,
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });

    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const inputService = new InputService<NumberNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });

    entityConfigNode.integration.setStatus(status);
    const controller = new NumberController({
        inputService,
        integration: entityConfigNode.integration,
        node: this,
        status,
        ...controllerDeps,
    });

    if (this.config.mode === ValueIntegrationMode.Listen) {
        const entityConfigEvents = new Events({
            node: this,
            emitter: entityConfigNode,
        });
        entityConfigEvents.setStatus(status);
        entityConfigEvents.addListener(
            IntegrationEvent.ValueChange,
            controller.onValueChange.bind(controller),
        );
    }
}
