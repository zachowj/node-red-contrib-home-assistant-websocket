import Joi from 'joi';

import { PropertySelectorType } from '../../common/const';
import { createControllerDependencies } from '../../common/controllers/helpers';
import ComparatorService from '../../common/services/ComparatorService';
import InputService, { NodeInputs } from '../../common/services/InputService';
import Status from '../../common/status/Status';
import TransformState from '../../common/TransformState';
import { ComparatorType, TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import { OutputType } from './const';
import GetEntitiesController from './GetEntitiesController';
import { Rule } from './types';

export interface GetEntitiesNodeProperties extends BaseNodeProperties {
    rules: Rule[];
    outputType: OutputType;
    outputEmptyResults: boolean;
    outputLocationType: string;
    outputLocation: string;
    outputResultsCount: number;
}

export interface GetEntitiesNode extends BaseNode {
    config: GetEntitiesNodeProperties;
}

const inputs: NodeInputs = {
    outputType: {
        messageProp: 'payload.outputType',
        configProp: 'outputType',
    },
    outputEmptyResults: {
        messageProp: 'payload.outputEmptyResults',
        configProp: 'outputEmptyResults',
    },
    outputLocationType: {
        messageProp: 'payload.outputLocationType',
        configProp: 'outputLocationType',
    },
    outputLocation: {
        messageProp: 'payload.outputLocation',
        configProp: 'outputLocation',
    },
    outputResultsCount: {
        messageProp: 'payload.outputResultsCount',
        configProp: 'outputResultsCount',
    },
    rules: {
        messageProp: 'payload.rules',
        configProp: 'rules',
    },
};

// convert enum to array of strings
const inputSchema: Joi.ObjectSchema = Joi.object({
    outputType: Joi.string()
        .valid(...Object.values(OutputType))
        .label('OutputType'),

    outputEmptyResults: Joi.boolean().label('outputEmptyResults'),

    outputLocationType: Joi.string()
        .valid(
            TypedInputTypes.Message,
            TypedInputTypes.Flow,
            TypedInputTypes.Global,
        )
        .label('outputLocationType'),
    outputLocation: Joi.string().label('outputLocation'),
    outputResultsCount: Joi.number().label('outputResultsCount'),
    rules: Joi.array()
        .items(
            Joi.object({
                condition: Joi.string().valid(
                    ...Object.values(PropertySelectorType),
                    '',
                ),
                property: Joi.when('logic', {
                    is: ComparatorType.JSONata,
                    then: Joi.any(),
                    otherwise: Joi.string(),
                }),
                logic: Joi.string().valid(...Object.values(ComparatorType), ''),
                value: Joi.string().allow(''),
                valueType: Joi.string().valid(
                    ...Object.values(TypedInputTypes),
                    '',
                ),
            }),
        )
        .label('rules'),
});

export default function getEntitiesNode(
    this: GetEntitiesNode,
    config: GetEntitiesNodeProperties,
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<GetEntitiesNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const transformState = new TransformState(
        serverConfigNode.config.ha_boolean,
    );
    const comparatorService = new ComparatorService({
        nodeRedContextService: controllerDeps.nodeRedContextService,
        homeAssistant,
        jsonataService: controllerDeps.jsonataService,
        transformState,
    });

    // eslint-disable-next-line no-new
    new GetEntitiesController({
        comparatorService,
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
