export interface LastPayloadData {
    state?: string | number | boolean;
    attributes?: Record<string, any>;
    available?: boolean;
}

export interface NodeData {
    isEnabled: boolean;
    lastPayload: LastPayloadData;
}

export interface StorageData {
    nodes: { [key: string]: NodeData };
    issues: { hidden: string[] };
}

export const PACKAGE_NAME = 'node-red-contrib-home-assistant-websocket';
