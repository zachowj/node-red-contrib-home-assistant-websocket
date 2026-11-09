import { NodeContextData } from 'node-red';

import { NodeData, StorageData } from './types';

export const CONTEXT_KEY = 'nodeRedHomeAssistantStorage';

export default class ContextStorage {
    #context: NodeContextData;
    #store: string | undefined;
    #data?: StorageData;
    #queue: Promise<void> = Promise.resolve();

    constructor(context: NodeContextData, store?: string) {
        this.#context = context;
        this.#store = store;
    }

    getNode(nodeId: string): NodeData | undefined {
        return structuredClone(this.#data?.nodes[nodeId]);
    }

    getIssues(): string[] {
        return [...(this.#data?.issues.hidden ?? [])];
    }

    async load(): Promise<StorageData | undefined> {
        return this.#enqueue(async () => {
            const value = await new Promise<unknown>((resolve, reject) => {
                this.#context.get(CONTEXT_KEY, this.#store, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
            if (isStorageData(value)) {
                this.#data = structuredClone(value);
            } else if (value === undefined) {
                this.#data = undefined;
            } else {
                throw new Error('Invalid Home Assistant context storage data');
            }
            return this.#data === undefined
                ? undefined
                : structuredClone(this.#data);
        });
    }

    update(update: (data: StorageData) => void): Promise<void> {
        return this.#enqueue(async () => {
            if (!this.#data) {
                throw new Error('Context storage has not been initialized');
            }
            const data = structuredClone(this.#data);
            update(data);
            await this.#write(data, this.#store);
            this.#data = data;
        });
    }

    initialize(data: StorageData): Promise<void> {
        return this.#enqueue(async () => {
            const snapshot = structuredClone(data);
            await this.#write(snapshot, this.#store);
            this.#data = snapshot;
        });
    }

    switchStore(
        store: string | undefined,
        saveSelection: () => Promise<void>,
    ): Promise<void> {
        return this.#enqueue(async () => {
            if (!this.#data) {
                throw new Error('Context storage has not been initialized');
            }
            if (store === this.#store) return;
            await this.#write(structuredClone(this.#data), store);
            await saveSelection();
            this.#store = store;
        });
    }

    #enqueue<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.#queue.then(operation);
        this.#queue = result.then(
            () => undefined,
            () => undefined,
        );
        return result;
    }

    #write(data: StorageData, store?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.#context.set(CONTEXT_KEY, data, store, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}

function isStorageData(value: unknown): value is StorageData {
    if (
        !value ||
        typeof value !== 'object' ||
        !('nodes' in value) ||
        !('issues' in value)
    ) {
        return false;
    }
    const { nodes, issues } = value;
    return (
        !!nodes &&
        typeof nodes === 'object' &&
        !Array.isArray(nodes) &&
        !!issues &&
        typeof issues === 'object' &&
        'hidden' in issues &&
        Array.isArray(issues.hidden) &&
        issues.hidden.every((item: unknown) => typeof item === 'string')
    );
}
