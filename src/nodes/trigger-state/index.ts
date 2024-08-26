import Joi from 'joi';

import { IdSelectorType } from '../../common/const';
import { createControllerDependencies } from '../../common/controllers/helpers';
import ConfigError from '../../common/errors/ConfigError';
import { getErrorData } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import ComparatorService from '../../common/services/ComparatorService';
import InputService from '../../common/services/InputService';
import State from '../../common/State';
import EventsStatus from '../../common/status/EventStatus';
import { StatusColor, StatusShape } from '../../common/status/Status';
import TransformState, { TransformType } from '../../common/TransformState';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import { EntitySelectorList } from '../events-state';
import { Constraint, CustomOutput, DISABLE, ENABLE } from './const';
import { createStateChangeEvents } from './helpers';
import TriggerStateController from './TriggerStateController';
import TriggerStateStatus from './TriggerStateStatus';

export interface TriggerStateProperties extends BaseNodeProperties {
    entities: EntitySelectorList;
    debugEnabled: boolean;
    constraints: Constraint[];
    customOutputs: CustomOutput[];
    outputInitially: boolean;
    stateType: TransformType;
    enableInput: boolean;
    exposeAsEntityConfig: string;
}

export interface TriggerStateNode extends BaseNode {
    config: TriggerStateProperties;
}

const testingSchema = Joi.object({
    payload: Joi.object({
        entity_id: Joi.string().required(),
        old_state: Joi.object({
            state: Joi.string().required(),
        }).unknown(true),
        new_state: Joi.object({
            state: Joi.string().required(),
        }).unknown(true),
    }),
}).unknown(true);

const enableSchema = Joi.object({
    payload: Joi.string().valid(ENABLE, DISABLE),
}).unknown(true);

export default function triggerState(
    this: TriggerStateNode,
    config: TriggerStateProperties,
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    if (
        !this.config?.entities[IdSelectorType.Entity]?.length &&
        !this.config?.entities[IdSelectorType.Substring]?.length &&
        !this.config?.entities[IdSelectorType.Regex]?.length
    ) {
        const error = new ConfigError('trigger-state.error.entity_required');
        this.status({
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: error.statusMessage,
        });
        throw error;
    }

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const exposeAsConfigNode = getExposeAsConfigNode(
        this.config.exposeAsEntityConfig,
    );

    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    let status: EventsStatus;
    let state: State | undefined;

    if (exposeAsConfigNode) {
        status = new EventsStatus({
            clientEvents,
            config: serverConfigNode.config,
            exposeAsEntityConfigNode: exposeAsConfigNode,
            node: this,
        });
    } else {
        // create a state to track the enabled state of the node
        // only needed if the node is not exposed to HA
        const events = new Events({
            node: this,
            emitter: this,
        });
        state = new State(this);
        status = new TriggerStateStatus({
            clientEvents,
            config: serverConfigNode.config,
            events,
            exposeAsEntityConfigNode: exposeAsConfigNode,
            node: this,
            state,
        });
    }
    clientEvents.setStatus(status);
    exposeAsConfigNode?.integration.setStatus(status);
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
    const inputService = new InputService<TriggerStateProperties>({
        nodeConfig: this.config,
    });
    const controller = new TriggerStateController({
        comparatorService,
        inputService,
        node: this,
        state,
        status,
        transformState,
        ...controllerDeps,
    });
    controller.setExposeAsConfigNode(exposeAsConfigNode);

    // register custom inputs if inputs are enabled
    if (this.config.enableInput) {
        controller.addOptionalInput(
            'enable',
            enableSchema,
            controller.onInputEnabled.bind(controller),
        );
        controller.addOptionalInput(
            'testing',
            testingSchema,
            controller.onInputTesting.bind(controller),
        );
    }

    if (
        this.config.entities[IdSelectorType.Substring].length === 0 &&
        this.config.entities[IdSelectorType.Regex].length === 0
    ) {
        for (const entity of this.config.entities[IdSelectorType.Entity]) {
            const eventTopic = `ha_events:state_changed:${entity}`;
            clientEvents.addListener(
                eventTopic,
                controller.onEntityStateChanged.bind(controller),
            );
        }
    } else {
        clientEvents.addListener(
            'ha_events:state_changed',
            controller.onEntityStateChanged.bind(controller),
        );
    }

    if (controller.isEnabled && this.config.outputInitially) {
        const generateStateChanges = async () => {
            const events = createStateChangeEvents(homeAssistant);
            for (const event of events) {
                await controller.onEntityStateChanged(event).catch((e) => {
                    const { error, statusMessage } = getErrorData(e);
                    status.setError(statusMessage);
                    this.error(error);
                });
            }
        };
        // Here for when the node is deploy without the server config being deployed
        if (homeAssistant.isHomeAssistantRunning) {
            generateStateChanges();
        } else {
            clientEvents.addListener(
                ClientEvent.InitialConnectionReady,
                generateStateChanges,
            );
        }
    }
}
