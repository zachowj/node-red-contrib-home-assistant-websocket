import { Node } from 'node-red';

import { RED } from '../../../globals';
import ContextStorage from './ContextStorage';
import {
    initializeContextStorage,
    MIGRATION_SETTING,
} from './ContextStorageMigration';
import {
    canConfirmContextStorePersistence,
    ContextStoreConfiguration,
    getContextStores,
    isKnownMemoryContextStore,
    isKnownPersistentContextStore,
    validateContextStore,
} from './ContextStores';
import { LastPayloadData, NodeData, PACKAGE_NAME } from './types';

export { LastPayloadData, NodeData, PACKAGE_NAME, StorageData } from './types';
export const STORE_SETTING = `${PACKAGE_NAME}.contextStore`;
export const PERSISTENT_STORES_SETTING = `${PACKAGE_NAME}.persistentContextStores`;

export class Storage {
    #backend?: ContextStorage;
    #initializing?: Promise<void>;
    #store?: string;
    #initialized = false;
    #failed = false;
    #resolved = false;
    #legacyImported = false;
    #operations: Promise<void> = Promise.resolve();
    #ready: Promise<void>;
    #resolveReady!: () => void;
    #rejectReady!: (error: unknown) => void;

    constructor() {
        this.#ready = new Promise((resolve, reject) => {
            this.#resolveReady = resolve;
            this.#rejectReady = reject;
        });
        this.#ready.catch(() => undefined);
    }

    public async init(): Promise<void> {
        if (this.#initialized) return;
        const stores = getContextStores(this.#configuration());
        const configured = RED.settings.get(STORE_SETTING);
        this.#store =
            typeof configured === 'string' ? configured : stores.defaultStore;
        this.#initialized = true;
        const message = `Home Assistant state uses Node-RED context store "${this.#store}".`;
        if (isKnownPersistentContextStore(this.#store, this.#configuration())) {
            RED.log.info(message);
        } else {
            RED.log.warn(
                `${message} Values may not survive a restart unless this store is persistent.`,
            );
        }
    }

    public attach(node: Node): Promise<void> {
        if (this.#initializing) return this.#ready;
        this.#initializing = this.#operations.then(() => this.#start(node));
        this.#operations = this.#initializing.catch(() => undefined);
        this.#initializing.then(
            () => {
                this.#resolved = true;
                this.#resolveReady();
            },
            (error) => {
                this.#failed = true;
                this.#rejectReady(error);
            },
        );
        return this.#ready;
    }

    async #start(node: Node): Promise<void> {
        await this.init();
        validateContextStore(this.#store!, this.#configuration());
        const backend = new ContextStorage(node.context().global, this.#store);
        if (!RED.settings.userDir)
            throw new Error('Node-RED user directory is unavailable');
        await initializeContextStorage(
            backend,
            RED.settings,
            RED.settings.userDir,
            this.#isStorePersistenceConfirmed(this.#store!),
            () => {
                this.#legacyImported = true;
            },
        );
        this.#backend = backend;
    }

    public whenReady(): Promise<void> {
        return this.#ready;
    }

    public pending(): Promise<void> | undefined {
        return this.#initializing && !this.#resolved ? this.#ready : undefined;
    }

    public isReady(): boolean {
        return this.#backend !== undefined;
    }

    public getStoreInfo() {
        const { stores, defaultStore } = getContextStores(
            this.#configuration(),
        );
        const selectedStore = this.#store ?? defaultStore;
        const acknowledgedStores = this.#getAcknowledgedStores();
        const persistentStores = stores.filter((store) =>
            isKnownPersistentContextStore(store, this.#configuration()),
        );
        return {
            stores,
            defaultStore,
            selectedStore,
            persistentStores,
            ready: this.isReady(),
            failed: this.#failed,
            legacyImported: this.#legacyImported,
            migrationPending: RED.settings.get(MIGRATION_SETTING) !== true,
            persistenceConfirmed:
                this.#isStorePersistenceConfirmed(selectedStore),
            persistenceAcknowledged: acknowledgedStores.includes(selectedStore),
            acknowledgedStores,
            confirmableStores: stores.filter((store) =>
                canConfirmContextStorePersistence(store, this.#configuration()),
            ),
        };
    }

    public async setStore(
        store: string,
        persistentAcknowledged?: boolean,
    ): Promise<void> {
        const change = this.#operations.then(() =>
            this.#setStore(store, persistentAcknowledged),
        );
        this.#operations = change.catch(() => undefined);
        return change;
    }

    async #setStore(
        store: string,
        persistentAcknowledged?: boolean,
    ): Promise<void> {
        validateContextStore(store, this.#configuration());
        if (
            persistentAcknowledged &&
            isKnownMemoryContextStore(store, this.#configuration())
        ) {
            throw new Error(
                `Memory context store "${store}" cannot persist data across restarts`,
            );
        }
        const acknowledgedStores = this.#getAcknowledgedStores();
        const nextAcknowledgedStores = new Set(acknowledgedStores);
        if (canConfirmContextStorePersistence(store, this.#configuration())) {
            if (persistentAcknowledged === true) {
                nextAcknowledgedStores.add(store);
            } else if (persistentAcknowledged === false) {
                nextAcknowledgedStores.delete(store);
            }
        }
        const saveSelection = () =>
            this.#persistSelection(store, [...nextAcknowledgedStores]);

        if (!this.#backend) {
            await saveSelection();
            this.#store = store;
            return;
        }
        if (store === this.#store) {
            await saveSelection();
            return;
        }
        await this.#backend!.switchStore(store, saveSelection);
        this.#store = store;
    }

    async #persistSelection(
        store: string,
        acknowledgedStores: string[],
    ): Promise<void> {
        const previousStore = this.#store;
        const previousAcknowledgements = this.#getAcknowledgedStores();
        const previousMigration = RED.settings.get(MIGRATION_SETTING);
        const migrationComplete =
            previousMigration === true ||
            this.#isStorePersistenceConfirmed(store, acknowledgedStores);
        try {
            await RED.settings.set(STORE_SETTING, store);
            await RED.settings.set(
                PERSISTENT_STORES_SETTING,
                acknowledgedStores,
            );
            if (migrationComplete && previousMigration !== true) {
                await RED.settings.set(MIGRATION_SETTING, true);
            }
        } catch (error) {
            try {
                await RED.settings.set(STORE_SETTING, previousStore);
                await RED.settings.set(
                    PERSISTENT_STORES_SETTING,
                    previousAcknowledgements,
                );
                if (previousMigration !== true) {
                    await RED.settings.set(
                        MIGRATION_SETTING,
                        previousMigration,
                    );
                }
            } catch (rollbackError) {
                RED.log.error(rollbackError as Error);
            }
            throw error;
        }
    }

    #getAcknowledgedStores(): string[] {
        const stores = RED.settings.get(PERSISTENT_STORES_SETTING);
        return Array.isArray(stores)
            ? stores.filter(
                  (store): store is string => typeof store === 'string',
              )
            : [];
    }

    #isStorePersistenceConfirmed(
        store: string,
        acknowledgedStores = this.#getAcknowledgedStores(),
    ): boolean {
        return (
            isKnownPersistentContextStore(store, this.#configuration()) ||
            acknowledgedStores.includes(store)
        );
    }

    #configuration(): ContextStoreConfiguration | undefined {
        return RED.settings.contextStorage as
            ContextStoreConfiguration | undefined;
    }

    #nodeSlug(nodeId: string): string {
        return nodeId.replace(/\./g, '_');
    }

    public async saveNodeData(
        nodeId: string,
        key: keyof NodeData,
        value: boolean | LastPayloadData,
    ): Promise<void> {
        await this.whenReady();
        await this.#backend!.update((data) => {
            const slug = this.#nodeSlug(nodeId);
            data.nodes[slug] ??= {} as NodeData;
            if (key === 'isEnabled')
                data.nodes[slug].isEnabled = value as boolean;
            else data.nodes[slug].lastPayload = value as LastPayloadData;
        });
    }

    public getNodeData(nodeId: string, key: 'isEnabled'): boolean | undefined;
    public getNodeData(
        nodeId: string,
        key: 'lastPayload',
    ): LastPayloadData | undefined;

    public getNodeData(nodeId: string): NodeData | undefined;
    public getNodeData(
        nodeId: string,
        key?: keyof NodeData,
    ): boolean | LastPayloadData | NodeData | undefined {
        const node = this.#backend?.getNode(this.#nodeSlug(nodeId));
        return key ? node?.[key] : node;
    }

    public async removeNodeData(nodeId: string): Promise<boolean> {
        await this.whenReady();
        await this.#backend!.update((data) => {
            delete data.nodes[this.#nodeSlug(nodeId)];
        });
        return true;
    }

    public async saveIssues(ids: string[]): Promise<void> {
        await this.whenReady();
        await this.#backend!.update((data) => {
            data.issues.hidden = [...ids];
        });
    }

    public getIssues(): string[] {
        return this.#backend?.getIssues() ?? [];
    }
}

export default new Storage();
