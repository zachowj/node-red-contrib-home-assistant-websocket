import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import InputService, { NodeInputs } from '../../common/services/InputService';
import { ContextLocation } from '../../common/services/NodeRedContextService';
import Status from '../../common/status/Status';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import { EntityFilterType, OutputType } from './const';
import GetHistoryController from './GetHistoryController';

export interface GetHistoryNodeProperties extends BaseNodeProperties {
    startdate: string;
    enddate: string;
    entityId: string;
    entityIdType: EntityFilterType;
    useRelativeTime: boolean;
    relativeTime: string;
    flatten: boolean;
    outputType: OutputType;
    outputLocationType: ContextLocation;
    outputLocation: string;
}

export interface GetHistoryNode extends BaseNode {
    config: GetHistoryNodeProperties;
}

const inputs: NodeInputs = {
    startDate: {
        messageProp: ['payload.startDate'],
        configProp: 'startDate',
    },
    endDate: {
        messageProp: ['payload.endDate'],
        configProp: 'endDate',
    },
    entityId: {
        messageProp: ['payload.entityId'],
        configProp: 'entityId',
    },
    entityIdType: {
        messageProp: ['payload.entityIdType'],
        configProp: 'entityIdType',
    },
    relativeTime: {
        messageProp: ['payload.relativeTime'],
        configProp: 'relativeTime',
    },
    flatten: {
        messageProp: ['payload.flatten'],
        configProp: 'flatten',
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    startDate: Joi.date().optional().allow(''),
    endDate: Joi.date().optional().allow(''),
    entityId: Joi.string().optional(),
    entityIdType: Joi.string()
        .valid(...Object.values(EntityFilterType))
        .optional(),
    relativeTime: Joi.string().optional().allow(''),
    flatten: Joi.boolean().optional(),
});

export default function getHistoryNode(
    this: GetHistoryNode,
    config: GetHistoryNodeProperties,
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<GetHistoryNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    // eslint-disable-next-line no-new
    new GetHistoryController({
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
