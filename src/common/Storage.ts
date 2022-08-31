import fs from 'fs';
import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

import { RED } from '../globals';

export interface LastPayloadData {
    state: string | number | boolean;
    attributes: Record<string, any>;
}

export interface NodeData {
    isEnabled: boolean;
    lastPayload: LastPayloadData;
}

export interface StorageData {
    nodes: { [key: string]: NodeData };
}

export const PACKAGE_NAME = 'node-red-contrib-home-assistant-websocket';
const FILENAME = `${PACKAGE_NAME}.json`;

export class Storage {
    #adapter?: low.AdapterAsync;
    #DB?: low.LowdbAsync<StorageData>;
    #path?: string;

    constructor({
        path,
        adapter,
    }: {
        path?: string;
        adapter?: low.AdapterAsync;
    } = {}) {
        this.#adapter = adapter;
        this.#path = path;
    }

    // check permissions off file path
    public checkPermissions(path?: string): boolean {
        if (!path) return true;

        try {
            fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            throw new Error(
                'Cannot read/write to storage file for Home Assistant nodes'
            );
        }

        return true;
    }

    public async init(): Promise<void> {
        const path = this.#path ?? RED.settings.userDir;
        const dbLocation = `${path}/${FILENAME}`;

        if (this.checkPermissions(path)) {
            const adapter = this.#adapter ?? new FileAsync(dbLocation);
            this.#DB = await low(adapter);
            await this.#DB.defaults({ nodes: {} }).write();
        }
    }

    // Replace . with _ to avoid issues with dot in node id
    #nodeSlug(nodeId: string) {
        return nodeId.replace(/\./g, '_');
    }

    public async saveNodeData(
        nodeId: string,
        key: keyof NodeData,
        value: boolean | LastPayloadData
    ): Promise<void> {
        if (!this.#DB) {
            throw new Error('cannot save node data without a db');
        }
        const path = `nodes.${this.#nodeSlug(nodeId)}.${key}`;

        return this.#DB.set(path, value).write();
    }

    public getNodeData(nodeId: string, key?: 'isEnabled'): boolean | undefined;

    public getNodeData(
        nodeId: string,
        key?: 'lastPayload'
    ): LastPayloadData | undefined;

    public getNodeData(nodeId: string): NodeData;

    public getNodeData(
        nodeId: string,
        key?: keyof NodeData
    ): boolean | LastPayloadData | NodeData | undefined {
        if (!this.#DB) {
            throw new Error('cannot get node data without a db');
        }
        const nodes = this.#DB.get('nodes').value();
        const node = nodes[this.#nodeSlug(nodeId)];
        if (!node) {
            return;
        }
        if (!key) {
            return node;
        }

        return node[key];
    }

    public async removeNodeData(nodeId: string): Promise<boolean> {
        if (!this.#DB) {
            throw new Error('cannot remove node data without a db');
        }

        await this.#DB.unset(`nodes.${this.#nodeSlug(nodeId)}`).write();
        return true;
    }
}

export default new Storage();
