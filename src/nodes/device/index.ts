import { Node, NodeDef } from 'node-red';

import { HassExposedConfig } from '../../editor/types';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { EventsStatus, Status } from '../../helpers/status';
import { checkValidServerConfig } from '../../helpers/utils';
import { Credentials } from '../../homeAssistant';
import { BaseNode, ServerNode } from '../../types/nodes';
import DeviceAction from './action-controller';
import DeviceTrigger from './trigger-controller';

interface BaseNodeDef extends NodeDef {
    version: number;
    debugenabled?: boolean;
    server?: string;
    entityConfigNode?: string;
    exposeToHomeAssistant?: boolean;
    outputs?: number;
    haConfig?: HassExposedConfig[];
}

interface BaseNodeConfig {
    debugenabled?: boolean;
    name: string;
    server?: ServerNode<Credentials>;
    version: number;
}

interface DeviceNodeConfig extends BaseNodeConfig {
    deviceType: string;
}

export interface DeviceNode extends Node {
    config: DeviceNodeConfig;
    controller: any;
}

export default function deviceNode(this: DeviceNode, config: BaseNodeDef) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    checkValidServerConfig(this, this.config.server?.config.id);
    const params = {
        node: this,
        config: this.config,
        RED,
    };
    switch (this.config.deviceType) {
        case 'action': {
            const status = new Status(this as unknown as BaseNode);
            this.controller = new DeviceAction({ ...params, status });
            break;
        }
        case 'trigger': {
            const status = new EventsStatus(this as unknown as BaseNode);
            this.controller = new DeviceTrigger({ ...params, status });
            break;
        }
        default:
            this.status({ text: 'Error' });
            throw new Error(`Invalid entity type: ${this.config.deviceType}`);
    }
}
