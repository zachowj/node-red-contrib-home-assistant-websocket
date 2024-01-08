import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import ComparatorService from '../../common/services/ComparatorService';
import InputService, { NodeInputs } from '../../common/services/InputService';
import Status from '../../common/status/Status';
import TransformState, { TransformType } from '../../common/TransformState';
import { ComparatorType, TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import CurrentStateController from './CurrentStateController';

export interface CurrentStateNodeProperties extends BaseNodeProperties {
    halt_if: string;
    halt_if_type: string;
    halt_if_compare: ComparatorType;
    entity_id: string;
    state_type: TransformType;
    blockInputOverrides: boolean;
    outputProperties: OutputProperty[];
    for: string;
    forType: TypedInputTypes;
    forUnits: string;
}

export interface CurrentStateNode extends BaseNode {
    config: CurrentStateNodeProperties;
}

const inputs: NodeInputs = {
    entityId: {
        messageProp: ['payload.entity_id', 'payload.entityId'],
        configProp: 'entity_id',
    },
};

const inputSchema: Joi.ObjectSchema = Joi.object({
    entityId: Joi.string().required(),
});

export default function currentStateNode(
    this: CurrentStateNode,
    config: CurrentStateNodeProperties,
): void {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    const inputService = new InputService<CurrentStateNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });
    if (this.config.blockInputOverrides) {
        inputService.disableInputOverrides();
    }
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
    new CurrentStateController({
        comparatorService,
        inputService,
        node: this,
        status,
        transformState,
        ...controllerDeps,
    });
}
