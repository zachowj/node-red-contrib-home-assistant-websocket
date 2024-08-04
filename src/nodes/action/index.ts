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

function customActionValidation(
    value: string | undefined,
    helpers: Joi.CustomHelpers,
) {
    const { domain, service } = helpers.state.ancestors[0];

    if (!value && !domain && !service) {
        return helpers.message({ custom: 'Action is required' });
    }

    if (typeof value !== 'string') {
        return helpers.message({ custom: 'Action must be a string' });
    }

    return value;
}

function customDomainServiceValidation(
    value: string | undefined,
    helpers: Joi.CustomHelpers,
) {
    const { action } = helpers.state.ancestors[0];

    if (action) {
        return value;
    }

    if (!value) {
        return helpers.message({
            custom: 'Both domain and service are required',
        });
    }

    if (typeof value !== 'string') {
        return helpers.message({
            custom: `${helpers.state.path?.[0]} must be a string`,
        });
    }

    return value;
}

// TODO: Custom validation can be removed after version 1.0
const inputSchema: Joi.ObjectSchema = Joi.object({
    action: Joi.custom(customActionValidation),
    data: Joi.alternatives(Joi.string().allow(''), Joi.object()).required(),
    target: Joi.object().keys({
        floor_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        area_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        device_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        entity_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
        label_id: Joi.alternatives(Joi.string(), Joi.array().optional()),
    }),
    // deprecated
    domain: Joi.custom(customDomainServiceValidation),
    service: Joi.custom(customDomainServiceValidation),
});

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
