import createNode from '../../helpers/createNode';
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
    createNode(this, config);
    this.config = migrate(config);
}
