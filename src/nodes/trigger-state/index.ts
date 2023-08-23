import Joi from 'joi';

import { createControllerDependencies } from '../../common/controllers/helpers';
import ConfigError from '../../common/errors/ConfigError';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import ComparatorService from '../../common/services/ComparatorService';
import InputService from '../../common/services/InputService';
import State from '../../common/State';
import EventsStatus from '../../common/status/EventStatus';
import TransformState, { TransformType } from '../../common/TransformState';
import { EntityFilterType } from '../../const';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import { Constraint, CustomOutput, DISABLE, ENABLE } from './const';
import TriggerStateController from './TriggerStateController';
import TriggerStateStatus from './TriggerStateStatus';

export interface TriggerStateProperties extends BaseNodeProperties {
    entityId: string | string[];
    entityIdType: string;
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
    config: TriggerStateProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    if (!this.config.entityId) {
        throw new ConfigError('trigger-state.error.enttity_id_required');
    }

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const exposeAsConfigNode = getExposeAsConfigNode(
        this.config.exposeAsEntityConfig
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
        serverConfigNode.config.ha_boolean
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
        exposeAsConfigNode,
        inputService,
        node: this,
        state,
        status,
        transformState,
        ...controllerDeps,
    });

    // register custom inputs if inputs are enabled
    if (this.config.enableInput) {
        controller.addOptionalInput(
            'enable',
            enableSchema,
            controller.onInputEnabled.bind(controller)
        );
        controller.addOptionalInput(
            'testing',
            testingSchema,
            controller.onInputTesting.bind(controller)
        );
    }

    let eventTopic = 'ha_events:state_changed';

    // If the entity id type is exact, then we need to listen to a specific entity
    if (this.config.entityIdType === EntityFilterType.Exact) {
        const id = Array.isArray(this.config.entityId)
            ? this.config.entityId[0]
            : this.config.entityId;
        eventTopic = `${eventTopic}:${id.trim()}`;
    }

    clientEvents.addListener(
        eventTopic,
        controller.onEntityStateChanged.bind(controller)
    );

    if (this.config.outputInitially) {
        // Here for when the node is deploy without the server config being deployed
        if (homeAssistant.isHomeAssistantRunning) {
            controller.onDeploy();
        } else {
            clientEvents.addListener(
                'ha_client:initial_connection_ready',
                controller.onStatesLoaded.bind(controller)
            );
        }
    }
}
