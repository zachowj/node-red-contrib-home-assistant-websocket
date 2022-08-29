import { Node, NodeDef, NodeMessage } from 'node-red';

import { ContextLocation } from '../common/services/NodeRedContextService';
import { TypedInputTypes } from '../common/services/TypedInputService';
import HomeAssistant from '../homeAssistant/HomeAssistant';
import ConfigServer from '../nodes/config-server/controller';
import { SelectorType } from '../nodes/config-server/editor';
import { DateTimeFormatOptions } from '../types/DateTimeFormatOptions';

export type NodeSend = (
    msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>
) => void;
export type NodeDone = (err?: Error) => void;

export interface NodeProperties extends NodeDef {
    debugenabled?: boolean;
    version: number;
}

export interface BaseNodeProperties extends NodeProperties {
    server?: string;
}

export interface EntityBaseNodeProperties extends NodeProperties {
    entityType: string;
    entityConfig?: string;
}

export interface ServerNodeConfig extends NodeProperties {
    addon: boolean;
    rejectUnauthorizedCerts: boolean;
    ha_boolean: string;
    connectionDelay: boolean;
    cacheJson: boolean;
    heartbeat: boolean;
    heartbeatInterval: number;
    areaSelector: SelectorType;
    deviceSelector: SelectorType;
    entitySelector: SelectorType;
    statusSeparator: string;
    statusYear: DateTimeFormatOptions['year'] | 'hidden';
    statusMonth: DateTimeFormatOptions['month'] | 'hidden';
    statusDay: DateTimeFormatOptions['day'] | 'hidden';
    statusHourCycle: DateTimeFormatOptions['hourCycle'] | 'default';
    statusTimeFormat: 'h:m' | 'h:m:s' | 'h:m:s.ms';
}

export type OutputProperty = {
    property: string;
    propertyType: ContextLocation;
    value: string;
    valueType: TypedInputTypes;
};

export interface ServerNode<T> extends Node<T> {
    config: ServerNodeConfig;
    controller: ConfigServer;
    getHomeAssistant: () => HomeAssistant;
}

export interface BaseNodeConfig extends NodeProperties {
    version: number;
    debugenabled?: boolean;
    server?: string;
    entityConfigNode?: string;
    exposeToHomeAssistant?: boolean;
    outputs?: number;
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

export interface EntityNode extends Node {
    config: EntityBaseNodeProperties;
    controller: any;
}
