import Joi from 'joi';

import {
    createControllerDependencies,
    createExposeAsControllerDependences,
} from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import { IntegrationEvent } from '../../common/integration/Integration';
import InputService, { NodeInputs } from '../../common/services/InputService';
import State from '../../common/State';
import Status from '../../common/status/Status';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { Credentials, getHomeAssistant } from '../../homeAssistant/index';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
    ServerNode,
} from '../../types/nodes';
import { SentenceMode, SentenceResponseType } from './const';
import SentenceInputController from './SentenceInputController';
import SentenceIntegration from './SentenceIntegration';
import SentenceOutputController from './SentenceOutputController';

export interface SentenceNodeProperties extends BaseNodeProperties {
    mode: SentenceMode;
    sentences: string[];
    response: string;
    responseType: TypedInputTypes;
    responseTimeout: number;
    triggerResponse: string;
    triggerResponseType: SentenceResponseType;
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

export interface SentenceNode extends BaseNode {
    config: SentenceNodeProperties;
}

export const inputs: NodeInputs = {
    response: {
        messageProp: 'payload.response',
        configProp: 'response',
        default: 'payload',
    },
    responseType: {
        messageProp: 'payload.responseType',
        configProp: 'responseType',
        default: 'msg',
    },
    responseId: {
        messageProp: '_sentence_response_id',
    },
};

export const inputSchema: Joi.ObjectSchema = Joi.object({
    response: Joi.string().required(),
    responseType: Joi.string()
        .valid(
            ...Object.values(SentenceResponseType),
            ...Object.values(TypedInputTypes),
        )
        .required(),
    responseId: Joi.number().required().messages({
        'any.required':
            '_sentence_response_id was not found in the message object',
    }),
});

export default function sentenceNode(
    this: SentenceNode,
    config: SentenceNodeProperties,
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    switch (this.config.mode) {
        case SentenceMode.Trigger:
            createTriggerNode(this, homeAssistant, serverConfigNode);
            break;
        case SentenceMode.Response:
            createResponseNode(this, homeAssistant, serverConfigNode);
            break;
        default:
            throw new Error('Invalid mode');
    }
}

function createTriggerNode(
    node: SentenceNode,
    homeAssistant: HomeAssistant,
    serverConfigNode: ServerNode<Credentials>,
) {
    const exposeAsConfigNode = getExposeAsConfigNode(
        node.config.exposeAsEntityConfig,
    );
    const controllerDeps = createExposeAsControllerDependences({
        exposeAsConfigNode,
        homeAssistant,
        node,
        serverConfigNode,
    });
    const integration = new SentenceIntegration({
        node,
        clientEvents: controllerDeps.clientEvents,
        homeAssistant,
        state: new State(node),
    });
    integration.setStatus(controllerDeps.status);

    const controller = new SentenceOutputController({
        node,
        ...controllerDeps,
    });
    controller.setExposeAsConfigNode(exposeAsConfigNode);
    const nodeEvents = new Events({ node, emitter: node });
    nodeEvents.addListener(
        IntegrationEvent.Trigger,
        controller.onReceivedMessage.bind(controller),
    );

    integration.init();
}

function createResponseNode(
    node: SentenceNode,
    homeAssistant: HomeAssistant,
    serverConfigNode: ServerNode<Credentials>,
) {
    const status = new Status({
        config: serverConfigNode.config,
        node,
    });

    const controllerDeps = createControllerDependencies(node, homeAssistant);
    const inputService = new InputService<SentenceNodeProperties>({
        inputs,
        nodeConfig: node.config,
        schema: inputSchema,
    });
    const clientEvents = new ClientEvents({
        node,
        emitter: homeAssistant.eventBus,
    });
    const integration = new SentenceIntegration({
        node,
        clientEvents,
        homeAssistant,
        state: new State(node),
    });
    // eslint-disable-next-line no-new
    new SentenceInputController({
        inputService,
        node,
        status,
        integration,
        ...controllerDeps,
    });
}
