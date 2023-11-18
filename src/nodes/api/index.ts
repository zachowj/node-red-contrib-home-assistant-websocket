import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import InputService, { NodeInputs } from '../../common/services/InputService';
import Status from '../../common/status/Status';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import ApiController from './ApiController';

export interface ApiNodeProperties extends BaseNodeProperties {
    protocol: string;
    method: string;
    path: string;
    data: string;
    dataType: TypedInputTypes;
    responseType: string;
    outputProperties: OutputProperty[];
    location?: string;
    locationType?: TypedInputTypes;
}

export interface ApiNode extends BaseNode {
    config: ApiNodeProperties;
}

export enum ApiMethod {
    Get = 'get',
    Post = 'post',
}

export enum ApiProtocol {
    Http = 'http',
    Websocket = 'websocket',
}

const inputs: NodeInputs = {
    protocol: {
        messageProp: 'payload.protocol',
        configProp: 'protocol',
    },
    method: {
        messageProp: 'payload.method',
        configProp: 'method',
    },
    path: {
        messageProp: 'payload.path',
        configProp: 'path',
    },
    data: {
        messageProp: 'payload.data',
        configProp: 'data',
    },
    dataType: {
        messageProp: 'payload.dataType',
        configProp: 'dataType',
    },
    location: {
        messageProp: 'payload.location',
        configProp: 'location',
    },
    locationType: {
        messageProp: 'payload.locationType',
        configProp: 'locationType',
    },
    responseType: {
        messageProp: 'payload.responseType',
        configProp: 'responseType',
    },
    outputProperties: {
        messageProp: 'payload.outputProperties',
        configProp: 'outputProperties',
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    protocol: Joi.string().valid(...Object.values(ApiProtocol)),
    method: Joi.string().valid(...Object.values(ApiMethod)),
    path: Joi.string().allow(''),
    dataType: Joi.string().valid(TypedInputTypes.JSON, TypedInputTypes.JSONata),
    data: Joi.optional(),
    location: Joi.string(),
    locationType: Joi.string().valid(
        TypedInputTypes.Message,
        TypedInputTypes.Flow,
        TypedInputTypes.Global,
        TypedInputTypes.None
    ),
    responseType: Joi.string().valid('json', 'text', 'arraybuffer'),
    outputProperties: Joi.array().items(),
});

export default function apiNode(
    this: ApiNode,
    config: ApiNodeProperties
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<ApiNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    // eslint-disable-next-line no-new
    new ApiController({
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
