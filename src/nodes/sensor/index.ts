import { NodeDef } from 'node-red';

import { createControllerDependencies } from '../../common/controllers/helpers';
import {
    SensorBaseNode,
    SensorBaseNodeProperties,
} from '../../common/controllers/SensorBaseController';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import InputService from '../../common/services/InputService';
import State from '../../common/State';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getConfigNodes } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { inputs, inputSchema } from '../binary-sensor';
import SensorController from './SensorController';

export type SensorNodeProperties = SensorBaseNodeProperties;

export interface SensorNode extends SensorBaseNode {
    config: SensorNodeProperties;
}

export default function Sensor(this: SensorNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);

    const { entityConfigNode, serverConfigNode } = getConfigNodes(this);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    const nodeEvents = new Events({ node: this, emitter: this });
    const state = new State(this);
    const status = new EventsStatus({
        config: serverConfigNode.config,
        clientEvents,
        nodeEvents,
        node: this,
        state,
    });
    clientEvents.setStatus(status);
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const inputService = new InputService<SensorNodeProperties>({
        inputs,
        nodeConfig: this.config,
        schema: inputSchema,
    });

    // eslint-disable-next-line no-new
    new SensorController({
        inputService,
        node: this,
        status,
        integration: entityConfigNode.integration,
        ...controllerDeps,
    });
}
