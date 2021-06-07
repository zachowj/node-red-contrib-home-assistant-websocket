import { Node } from 'node-red';

export interface ConfigNode extends Node {
    config: {
        name: string;
        version: number;
        legacy: boolean;
        addon: boolean;
        rejectUnauthorizedCerts: boolean;
        ha_boolean: string;
        connectionDelay: boolean;
        cacheJson: boolean;
    };
    controller: any;
}

export interface BaseNode extends Node {
    config: {
        debugenabled: {};
        name: string;
        server: ConfigNode;
        version: number;
    };
    controller: any;
}

export interface DeviceNode extends Node {
    config: {
        deviceType: string;
    };
    controller: any;
}

export interface EntityNode extends Node {
    config: {
        entityType: string;
    };
    controller: any;
}
