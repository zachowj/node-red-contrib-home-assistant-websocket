import { Node, NodeDef } from 'node-red';

import { Credentials } from '../homeAssistant';
import ConfigServer from '../nodes/config-server/controller';
import EntityConfigController from '../nodes/entity-config/controller';

export interface ServerNodeConfig extends NodeDef {
    name: string;
    version: number;
    addon: boolean;
    rejectUnauthorizedCerts: boolean;
    // eslint-disable-next-line camelcase
    ha_boolean: string;
    connectionDelay: boolean;
    cacheJson: boolean;
    heartbeat: boolean;
    heartbeatInterval: number;
}

export interface ServerNode<T> extends Node<T> {
    config: ServerNodeConfig;
    controller: ConfigServer;
}

export interface BaseNodeConfig {
    debugenabled: boolean;
    name: string;
    server?: ServerNode<Credentials>;
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

type OutputProperty = {
    property: string;
    propertyType: string;
    value: string;
    valueType: string;
};

export interface EntityNodeDef extends NodeDef {
    entityType: string;
    entityConfig: {
        controller: EntityConfigController;
    };
    outputProperties: OutputProperty[];
}

export interface EntityNode extends Node {
    config: EntityNodeDef;
    controller: any;
}
