import Joi from 'joi';
import { NodeDef } from 'node-red';

import { createControllerDependencies } from '../../common/controllers/helpers';
import {
    SensorBaseNode,
    SensorBaseNodeProperties,
} from '../../common/controllers/SensorBaseController';
import ClientEvents from '../../common/events/ClientEvents';
import InputService, { NodeInputs } from '../../common/services/InputService';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import SensorController from './SensorController';

export type SensorNodeProperties = SensorBaseNodeProperties;

export interface SensorNode extends SensorBaseNode {
    config: SensorNodeProperties;
}

const inputs: NodeInputs = {
    state: {
        messageProp: 'payload.state',
        configProp: 'state',
        default: 'payload',
    },
    stateType: {
        messageProp: 'payload.stateType',
        configProp: 'stateType',
        default: 'msg',
    },
    attributes: {
        messageProp: 'payload.attributes',
        configProp: 'attributes',
        default: [],
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    state: Joi.string().default('payload'),
    stateType: Joi.string()
        .valid('msg', 'flow', 'global', 'jsonata', 'str', 'num', 'bool')
        .default('msg'),
    attributes: Joi.array()
        .items(
            Joi.object({
                property: Joi.string().required(),
                value: Joi.any().required(),
                valueType: Joi.string()
                    .valid(
                        'msg.',
                        'flow',
                        'global',
                        'jsonata',
                        'str',
                        'num',
                        'bool',
                        'date'
                    )
                    .required(),
            })
        )
        .default([]),
});

export default function Sensor(this: SensorNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = serverConfigNode.getHomeAssistant();
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    const status = new EventsStatus(
        this,
        serverConfigNode.config,
        clientEvents
    );
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const inputService = new InputService<SensorNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });

    // eslint-disable-next-line no-new
    new SensorController({
        homeAssistant,
        inputService,
        node: this,
        status,
        integration: entityConfigNode.integration,
        ...controllerDeps,
    });
}
