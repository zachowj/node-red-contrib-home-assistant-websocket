import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import { inputErrorHandler } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import InputService, {
    DataSource,
    NodeInputs,
    ParsedMessage,
} from '../../common/services/InputService';
import Status from '../../common/status/Status';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import ActionController from './ActionController';
import { Queue } from './const';

export interface ActionNodeProperties extends BaseNodeProperties {
    action: string;
    data: string;
    dataType: string;
    areaId?: string[];
    deviceId?: string[];
    entityId?: string[];
    floorId?: string[];
    mergeContext: string;
    mustacheAltTags: boolean;
    queue: Queue;
    outputProperties: OutputProperty[];
    // TODO: Remove in version 1.0
    domain?: string;
    service?: string;
}

export interface ActionNode extends BaseNode {
    config: ActionNodeProperties;
}

const inputs: NodeInputs = {
    action: {
        messageProp: 'payload.action',
        configProp: 'action',
    },
    target: {
        messageProp: 'payload.target',
    },
    data: {
        messageProp: 'payload.data',
        configProp: 'data',
        default: {},
    },

    // deprecated
    // TODO: Remove in version 1.0
    domain: {
        messageProp: 'payload.domain',
        configProp: 'domain',
    },
    service: {
        messageProp: 'payload.service',
        configProp: 'service',
    },
};

function transformInput(
    this: InputService<ActionNodeProperties>,
    parsedMessage: ParsedMessage,
): ParsedMessage {
    const { domain, service } = parsedMessage;

    if (
        (domain.source === DataSource.Message ||
            service.source === DataSource.Message) &&
        domain.value &&
        service.value
    ) {
        parsedMessage.action.value = `${domain.value}.${service.value}`;
        parsedMessage.action.source = DataSource.Transformed;
    }

    return parsedMessage;
}

const inputSchema: Joi.ObjectSchema = Joi.object({
    action: Joi.string().required(),
    data: Joi.alternatives(Joi.string().allow(''), Joi.object()).required(),
    target: Joi.object().keys({
        floor_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        area_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        device_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        entity_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        label_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
    }),
}).unknown(true);

export default function actionNode(
    this: ActionNode,
    config: ActionNodeProperties,
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<ActionNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
        transform: transformInput,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    const controller = new ActionController({
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });

    // Handle queue items when HA reconnected and in the running state
    if (this.config.queue !== Queue.None) {
        if (homeAssistant.isHomeAssistantRunning) {
            try {
                controller.onClientReady();
            } catch (e) {
                inputErrorHandler(e, { status });
            }
        }

        const clientEvents = new ClientEvents({
            node: this,
            emitter: homeAssistant.eventBus,
        });

        clientEvents.addListener(
            ClientEvent.Ready,
            controller.onClientReady.bind(controller),
        );
    }
}
