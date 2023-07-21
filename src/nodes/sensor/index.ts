import { NodeDef } from 'node-red';

import { createControllerDependencies } from '../../common/controllers/helpers';
import {
    SensorBaseNode,
    SensorBaseNodeProperties,
} from '../../common/controllers/SensorBaseController';
import InputService from '../../common/services/InputService';
import Status from '../../common/status/Status';
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
    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
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
