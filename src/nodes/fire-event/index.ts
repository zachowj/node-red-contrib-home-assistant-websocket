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
import FireEventController from './FireEventController';

export interface FireEventNodeProperties extends BaseNodeProperties {
    server: string;
    version: number;
    event: string;
    data: string;
    dataType: TypedInputTypes;
}

export interface FireEventNode extends BaseNode {
    config: FireEventNodeProperties;
}

const inputs: NodeInputs = {
    event: {
        messageProp: 'payload.event',
        configProp: 'event',
    },
    data: {
        messageProp: 'payload.data',
        configProp: 'data',
    },
    dataType: {
        messageProp: 'payload.dataType',
        configProp: 'dataType',
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    event: Joi.string(),
    data: Joi.alternatives().try(Joi.string().empty(''), Joi.object()),
    dataType: Joi.string().valid(TypedInputTypes.JSON, TypedInputTypes.JSONata),
});

export default function fireEventNode(
    this: FireEventNode,
    config: FireEventNodeProperties
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<FireEventNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    // eslint-disable-next-line no-new
    new FireEventController({
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
