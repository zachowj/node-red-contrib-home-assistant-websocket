import Joi from 'joi';
import { NodeDef } from 'node-red';

import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import ComparatorService from '../../common/services/ComparatorService';
import InputService from '../../common/services/InputService';
import Status from '../../common/status/Status';
import TransformState from '../../common/TransformState';
import {
    ComparatorType,
    EntityFilterType,
    TimeUnit,
    TypedInputTypes,
} from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import WaitUntilController from './WaitUntilController';

export interface WaitUntilProperties {
    entityId: string;
    entityIdFilterType: EntityFilterType;
    property: string;
    comparator: ComparatorType;
    value: string;
    valueType: TypedInputTypes;
    timeout: string;
    timeoutType: TypedInputTypes.Number | TypedInputTypes.JSONata;
    timeoutUnits: TimeUnit;
    checkCurrentState: boolean;
    blockInputOverrides: boolean;
    outputProperties: OutputProperty[];
}

export interface WaitUntilNodeProperties
    extends WaitUntilProperties,
        BaseNodeProperties {}

export interface WaitUntilNode extends BaseNode {
    config: WaitUntilNodeProperties;
}

const inputs = {
    entityId: {
        messageProp: ['payload.entity_id', 'payload.entityId'],
        configProp: 'entityId',
    },
    entityIdFilterType: {
        messageProp: 'payload.entityIdFilterType',
        configProp: 'entityIdFilterType',
        default: 'exact',
    },
    property: {
        messageProp: 'payload.property',
        configProp: 'property',
    },
    comparator: {
        messageProp: 'payload.comparator',
        configProp: 'comparator',
    },
    value: {
        messageProp: 'payload.value',
        configProp: 'value',
    },
    valueType: {
        messageProp: 'payload.valueType',
        configProp: 'valueType',
    },
    timeout: {
        messageProp: 'payload.timeout',
        configProp: 'timeout',
    },
    timeoutUnits: {
        messageProp: 'payload.timeoutUnits',
        configProp: 'timeoutUnits',
    },
    checkCurrentState: {
        messageProp: 'payload.checkCurrentState',
        configProp: 'checkCurrentState',
    },
};

const defaultInputSchema = Joi.object({
    entityId: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string(),
        Joi.object().instance(RegExp)
    ),
    entityIdFilterType: Joi.string().valid(...Object.values(EntityFilterType)),
    property: Joi.string(),
    comparator: Joi.string().valid(...Object.values(ComparatorType)),
    value: Joi.alternatives().try(Joi.string(), Joi.number()),
    valueType: Joi.string(),
    timeout: Joi.alternatives()
        .try(Joi.string(), Joi.number())
        .allow('')
        .default('0'),
    timeoutUnits: Joi.string().valid(...Object.values(TimeUnit)),
    checkCurrentState: Joi.boolean(),
});

export default function waitUntilNode(this: WaitUntilNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    clientEvents.setStatus(status);
    const inputService = new InputService<WaitUntilNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: defaultInputSchema,
    });
    if (this.config.blockInputOverrides) {
        inputService.disableInputOverrides();
    }
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const transformState = new TransformState(
        serverConfigNode.config.ha_boolean
    );
    const comparatorService = new ComparatorService({
        nodeRedContextService: controllerDeps.nodeRedContextService,
        homeAssistant,
        jsonataService: controllerDeps.jsonataService,
        transformState,
    });

    // eslint-disable-next-line no-new
    new WaitUntilController({
        comparatorService,
        clientEvents,
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
