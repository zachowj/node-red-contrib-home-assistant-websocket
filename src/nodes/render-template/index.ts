import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import InputService, { NodeInputs } from '../../common/services/InputService';
import Status from '../../common/status/Status';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import RenderTemplateController from './RenderTemplateController';

export interface RenderTemplateNodeProperties extends BaseNodeProperties {
    template: string;
    resultsLocation: string;
    resultsLocationType: TypedInputTypes;
    templateLocation: string;
    templateLocationType: TypedInputTypes;
}

export interface RenderTemplateNode extends BaseNode {
    config: RenderTemplateNodeProperties;
}

const inputs: NodeInputs = {
    template: {
        messageProp: 'template',
        configProp: 'template',
    },
    resultsLocation: {
        messageProp: 'resultsLocation',
        configProp: 'resultsLocation',
    },
    resultsLocationType: {
        messageProp: 'resultsLocationType',
        configProp: 'resultsLocationType',
    },
    templateLocation: {
        messageProp: 'templateLocation',
        configProp: 'templateLocation',
    },
    templateLocationType: {
        messageProp: 'templateLocationType',
        configProp: 'templateLocationType',
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    template: Joi.string().required(),
    resultsLocation: Joi.string(),
    resultsLocationType: Joi.string().valid(
        TypedInputTypes.Message,
        TypedInputTypes.Flow,
        TypedInputTypes.Global
    ),
    templateLocation: Joi.string().empty(''),
    templateLocationType: Joi.string().valid(
        TypedInputTypes.Message,
        TypedInputTypes.Flow,
        TypedInputTypes.Global,
        TypedInputTypes.None
    ),
});

export default function renderTemplateNode(
    this: RenderTemplateNode,
    config: RenderTemplateNodeProperties
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<RenderTemplateNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    // eslint-disable-next-line no-new
    new RenderTemplateController({
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
