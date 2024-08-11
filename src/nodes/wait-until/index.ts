import Joi from 'joi';
import { NodeDef } from 'node-red';

import { IdSelectorType } from '../../common/const';
import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import ComparatorService from '../../common/services/ComparatorService';
import InputService, {
    DataSource,
    ParsedMessage,
} from '../../common/services/InputService';
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
import { EntitySelectorList } from '../events-state';
import WaitUntilController from './WaitUntilController';

export interface WaitUntilProperties {
    entities: EntitySelectorList;
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
    },
    entityIdFilterType: {
        messageProp: 'payload.entityIdFilterType',
        default: 'exact',
    },
    entities: {
        messageProp: 'payload.entities',
        configProp: 'entities',
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

function transformInput(
    this: InputService<WaitUntilNodeProperties>,
    parsedMessage: ParsedMessage,
): ParsedMessage {
    // If no entities are provided, use entityId
    if (parsedMessage.entityId.value) {
        const entities: EntitySelectorList = {
            [IdSelectorType.Entity]: [],
            [IdSelectorType.Substring]: [],
            [IdSelectorType.Regex]: [],
        };
        switch (parsedMessage.entityIdFilterType.value) {
            case EntityFilterType.Exact:
                entities[IdSelectorType.Entity] = [
                    parsedMessage.entityId.value,
                ];
                break;
            case EntityFilterType.Substring:
                entities[IdSelectorType.Substring] = [
                    parsedMessage.entityId.value,
                ];
                break;
            case EntityFilterType.Regex:
                entities[IdSelectorType.Regex] = [parsedMessage.entityId.value];
                break;
            case EntityFilterType.List:
                entities[IdSelectorType.Entity] = parsedMessage.entityId.value;
                break;
        }
        parsedMessage.entities.value = entities;
        parsedMessage.entities.source = DataSource.Transformed;
    }

    // each entities property should be an array
    [
        IdSelectorType.Entity,
        IdSelectorType.Substring,
        IdSelectorType.Regex,
    ].forEach((key) => {
        const value = parsedMessage.entities.value[key];
        if (!Array.isArray(value)) {
            parsedMessage.entities.value[key] = [];
        }
    });

    return parsedMessage;
}

const defaultInputSchema = Joi.object({
    entities: Joi.object({
        entity: Joi.array().items(Joi.string()),
        substring: Joi.array().items(Joi.string()),
        regex: Joi.array().items(Joi.string()),
    })
        .custom((value, helpers) => {
            const { entity, substring, regex } = value;

            if (
                entity?.length > 0 ||
                substring?.length > 0 ||
                regex?.length > 0
            ) {
                return value; // At least one array is not empty
            } else {
                return helpers.error('array.length');
            }
        })
        .message('ha-wait-until.error.no_entities_provided'),
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
}).unknown(true);

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
        transform: transformInput,
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
    new WaitUntilController({
        comparatorService,
        clientEvents,
        inputService,
        node: this,
        status,
        ...controllerDeps,
    });
}
