import { Node } from 'node-red';

export interface ServerNodeConfig {
    name: string;
    version: number;
    addon: boolean;
    rejectUnauthorizedCerts: boolean;
    // eslint-disable-next-line camelcase
    ha_boolean: string;
    connectionDelay: boolean;
    cacheJson: boolean;
}

export interface ServerNode extends Node {
    config: ServerNodeConfig;
    controller: any;
}

export interface BaseNodeConfig {
    debugenabled: boolean;
    name: string;
    server?: ServerNode;
    version: number;
}

export interface BaseNode extends Node {
    config: BaseNodeConfig;
    controller: any;
}

export interface DeviceNode extends BaseNode {
    config: BaseNodeConfig & {
        deviceType: string;
    };
}

export interface EntityNode extends BaseNode {
    config: BaseNodeConfig & {
        entityType: string;
    };
}
