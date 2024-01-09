import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import { inputErrorHandler } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import InputService, { NodeInputs } from '../../common/services/InputService';
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
import CallServiceController from './CallServiceController';
import { Queue } from './const';

export interface CallServiceNodeProperties extends BaseNodeProperties {
    domain: string;
    service: string;
    data: string;
    dataType: string;
    areaId?: string[];
    deviceId?: string[];
    entityId?: string[];
    mergeContext: string;
    mustacheAltTags: boolean;
    queue: Queue;
    outputProperties: OutputProperty[];
}

export interface CallServiceNode extends BaseNode {
    config: CallServiceNodeProperties;
}

const inputs: NodeInputs = {
    domain: {
        messageProp: 'payload.domain',
        configProp: 'domain',
    },
    service: {
        messageProp: 'payload.service',
        configProp: 'service',
    },
    target: {
        messageProp: 'payload.target',
    },
    data: {
        messageProp: 'payload.data',
        configProp: 'data',
        default: {},
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    domain: Joi.string().required(),
    service: Joi.string().required(),
    data: Joi.alternatives(Joi.string().allow(''), Joi.object()).required(),
    target: Joi.object().keys({
        area_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        device_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        entity_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
    }),
});

export default function callServiceNode(
    this: CallServiceNode,
    config: CallServiceNodeProperties,
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<CallServiceNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    const controller = new CallServiceController({
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
