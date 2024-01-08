import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';

export interface DeviceConfigNodeProperties extends BaseNodeProperties {
    hwVersion?: string;
    manufacturer?: string;
    model?: string;
    swVersion?: string;
}

export interface DeviceConfigNode extends BaseNode {
    config: DeviceConfigNodeProperties;
}

export default function deviceConfigNode(
    this: DeviceConfigNode,
    config: DeviceConfigNodeProperties,
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);
}
