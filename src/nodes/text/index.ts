import Joi from 'joi';

import {
    createControllerDependencies,
    createExposeAsControllerDependences,
} from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import { IntegrationEvent } from '../../common/integration/Integration';
import InputService, { NodeInputs } from '../../common/services/InputService';
import Status from '../../common/status/Status';
import { TypedInputTypes, ValueIntegrationMode } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes, getExposeAsConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant/index';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import TextController from './TextController';
import TextOutputController from './TextOutputController';

export interface TextNodeProperties extends EntityBaseNodeProperties {
    mode: ValueIntegrationMode;
    value: string;
    valueType: string;
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

export interface TextNode extends BaseNode {
    config: TextNodeProperties;
}

export const inputs: NodeInputs = {
    value: {
        messageProp: 'payload.text',
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
            TypedInputTypes.String,
        )
        .required(),
});

export default function textNode(this: TextNode, config: TextNodeProperties) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    switch (this.config.mode) {
        case ValueIntegrationMode.Get:
        case ValueIntegrationMode.Set:
            {
                const status = new Status({
                    config: serverConfigNode.config,
                    node: this,
                });

                const controllerDeps = createControllerDependencies(
                    this,
                    homeAssistant,
                );
                const inputService = new InputService<TextNodeProperties>({
                    inputs,
                    nodeConfig: this.config,
                    schema: inputSchema,
                });

                entityConfigNode.integration.setStatus(status);
                // eslint-disable-next-line no-new
                new TextController({
                    inputService,
                    integration: entityConfigNode.integration,
                    node: this,
                    status,
                    ...controllerDeps,
                });
            }
            break;
        case ValueIntegrationMode.Listen: {
            const exposeAsConfigNode = getExposeAsConfigNode(
                this.config.exposeAsEntityConfig,
            );
            const controllerDeps = createExposeAsControllerDependences({
                exposeAsConfigNode,
                homeAssistant,
                node: this,
                serverConfigNode,
            });

            const controller = new TextOutputController({
                node: this,
                ...controllerDeps,
            });
            controller.setExposeAsConfigNode(exposeAsConfigNode);

            const entityConfigEvents = new Events({
                node: this,
                emitter: entityConfigNode,
            });
            entityConfigEvents.setStatus(controllerDeps.status);
            entityConfigEvents.addListener(
                IntegrationEvent.ValueChange,
                controller.onValueChange.bind(controller),
            );
        }
    }
}
