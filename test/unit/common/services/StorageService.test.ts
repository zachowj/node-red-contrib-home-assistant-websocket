import { EventEmitter } from 'events';
import { Node, NodeAPI } from 'node-red';
import { describe, expect, it, vi } from 'vitest';

import storageService, {
    PERSISTENT_STORES_SETTING,
    Storage,
    STORE_SETTING,
} from '../../../../src/common/services/StorageService';
import { CONTEXT_KEY } from '../../../../src/common/services/StorageService/ContextStorage';
import { MIGRATION_SETTING } from '../../../../src/common/services/StorageService/ContextStorageMigration';
import State from '../../../../src/common/State';
import { setRED } from '../../../../src/globals';
import { BaseNode } from '../../../../src/types/nodes';

function createRuntime(initialStore = 'memory') {
    const values = new Map<string, unknown>([
        [STORE_SETTING, initialStore],
        [MIGRATION_SETTING, true],
    ]);
    const stores = new Map<string, unknown>();
    const settings = {
        userDir: '/tmp',
        contextStorage: {
            memory: { module: 'memory' },
            disk: { module: 'localfilesystem' },
            custom: { module: 'custom-store' },
        },
        get: (key: string) => values.get(key),
        set: vi.fn(async (key: string, value: unknown) => {
            values.set(key, value);
        }),
    };
    const log = { warn: vi.fn(), info: vi.fn(), error: vi.fn() };
    setRED({
        settings,
        log,
    } as unknown as NodeAPI);
    const node = new EventEmitter() as BaseNode;
    node.id = 'node.1';
    node.error = vi.fn();
    node.context = (() => ({
        global: {
            get: (
                _key: string,
                store: string,
                callback: (error: null, value: unknown) => void,
            ) => queueMicrotask(() => callback(null, stores.get(store))),
            set: (
                _key: string,
                value: unknown,
                store: string,
                callback: (error: null) => void,
            ) =>
                queueMicrotask(() => {
                    stores.set(store, structuredClone(value));
                    callback(null);
                }),
        },
    })) as Node['context'];
    return { node, values, stores, settings, log };
}

describe('storage service', () => {
    it('warns when the selected store is not known to persist data', async () => {
        const { log } = createRuntime('memory');
        await new Storage().init();
        expect(log.warn).toHaveBeenCalledOnce();
        expect(log.info).not.toHaveBeenCalled();
    });

    it('logs the selected localfilesystem store without a persistence warning', async () => {
        const { log } = createRuntime('disk');
        await new Storage().init();
        expect(log.info).toHaveBeenCalledOnce();
        expect(log.warn).not.toHaveBeenCalled();
    });

    it('restores legacy node identifiers and copies live values when switching stores', async () => {
        const { node, stores, values } = createRuntime();
        stores.set('memory', {
            nodes: { node_1: { isEnabled: false, lastPayload: { state: 42 } } },
            issues: { hidden: ['issue'] },
        });
        const storage = new Storage();
        await storage.init();
        await storage.attach(node);
        expect(storage.getStoreInfo().persistenceConfirmed).toBe(false);
        expect(storage.getNodeData('node.1', 'isEnabled')).toBe(false);
        expect(storage.getNodeData('node.1', 'lastPayload')).toEqual({
            state: 42,
        });
        await Promise.all([
            storage.saveNodeData('node.1', 'isEnabled', true),
            storage.setStore('disk'),
        ]);
        expect(storage.getStoreInfo().persistenceConfirmed).toBe(true);
        await storage.saveIssues(['new']);
        expect(stores.get('disk')).toEqual({
            nodes: { node_1: { isEnabled: true, lastPayload: { state: 42 } } },
            issues: { hidden: ['new'] },
        });
        expect(values.get(STORE_SETTING)).toBe('disk');
        expect(CONTEXT_KEY).toBe('nodeRedHomeAssistantStorage');
    });

    it('allows selecting a replacement after a configured store disappears', async () => {
        const { node, values } = createRuntime('removed');
        const storage = new Storage();
        await storage.init();
        await expect(storage.attach(node)).rejects.toThrow(
            'Unknown Node-RED context store',
        );
        expect(storage.getStoreInfo().failed).toBe(true);
        await storage.setStore('disk');
        expect(values.get(STORE_SETTING)).toBe('disk');
        expect(storage.getStoreInfo()).toMatchObject({
            selectedStore: 'disk',
            ready: false,
            failed: true,
        });
    });

    it('saves and revokes persistence confirmation for a custom store', async () => {
        const { node, values } = createRuntime();
        const storage = new Storage();
        await storage.init();
        await storage.attach(node);

        await storage.setStore('custom', true);
        expect(values.get(PERSISTENT_STORES_SETTING)).toEqual(['custom']);
        expect(storage.getStoreInfo()).toMatchObject({
            selectedStore: 'custom',
            persistenceConfirmed: true,
            persistenceAcknowledged: true,
        });

        await storage.setStore('custom', false);
        expect(values.get(PERSISTENT_STORES_SETTING)).toEqual([]);
        expect(storage.getStoreInfo()).toMatchObject({
            persistenceConfirmed: false,
            persistenceAcknowledged: false,
        });
    });

    it('does not allow the memory store to be acknowledged as persistent', async () => {
        createRuntime();
        const storage = new Storage();
        await storage.init();

        await expect(storage.setStore('memory', true)).rejects.toThrow(
            'cannot persist data across restarts',
        );
    });

    it('waits for a pending selection before initializing the first node', async () => {
        const { node, settings, stores } = createRuntime();
        let release!: () => void;
        const saved = new Promise<void>((resolve) => {
            release = resolve;
        });
        settings.set.mockImplementation(async () => saved);
        const storage = new Storage();
        await storage.init();
        const selection = storage.setStore('disk');
        await Promise.resolve();
        const initialization = storage.attach(node);
        release();
        await Promise.all([selection, initialization]);
        expect(stores.has('disk')).toBe(true);
        expect(stores.has('memory')).toBe(false);
        expect(storage.getStoreInfo().selectedStore).toBe('disk');
        expect(storage.getStoreInfo().persistenceConfirmed).toBe(true);
    });

    it('completes migration after copying the pending memory data to localfilesystem', async () => {
        const { node, values, stores } = createRuntime();
        values.set(MIGRATION_SETTING, false);
        stores.set('memory', {
            nodes: { node_1: { isEnabled: false, lastPayload: { state: 42 } } },
            issues: { hidden: [] },
        });
        const storage = new Storage();
        await storage.init();
        await storage.attach(node);
        expect(storage.getStoreInfo().migrationPending).toBe(true);

        await storage.setStore('disk');

        expect(stores.get('disk')).toMatchObject({
            nodes: { node_1: { isEnabled: false, lastPayload: { state: 42 } } },
        });
        expect(values.get(MIGRATION_SETTING)).toBe(true);
        expect(storage.getStoreInfo().migrationPending).toBe(false);
    });

    it('restores the selected setting if saving it fails', async () => {
        const { node, values, stores, settings } = createRuntime();
        const storage = new Storage();
        await storage.init();
        await storage.attach(node);
        settings.set.mockImplementationOnce(async (key, value) => {
            values.set(key, value);
            throw new Error('settings failed');
        });
        await expect(storage.setStore('disk')).rejects.toThrow(
            'settings failed',
        );
        expect(values.get(STORE_SETTING)).toBe('memory');
        await storage.saveIssues(['saved']);
        expect(stores.get('memory')).toMatchObject({
            issues: { hidden: ['saved'] },
        });
        expect(storage.getStoreInfo().selectedStore).toBe('memory');
    });

    it('does not expose default-enabled state while an async store is loading', async () => {
        const { node, stores } = createRuntime();
        stores.set('memory', {
            nodes: {
                node_1: { isEnabled: false, lastPayload: { state: 42 } },
                node_2: { isEnabled: true },
            },
            issues: { hidden: [] },
        });
        const earlyEvent = storageService
            .whenReady()
            .then(() => secondState.isEnabled());
        const state = new State(node);
        const secondNode = new EventEmitter() as BaseNode;
        secondNode.id = 'node.2';
        secondNode.error = vi.fn();
        const secondState = new State(secondNode);
        const changed = vi.fn();
        const done = vi.fn();
        (secondNode as unknown as EventEmitter).on('state_changed', changed);
        secondNode.emit('close', false, done);
        expect(state.isEnabled()).toBe(false);
        expect(state.getLastPayload()).toBeUndefined();
        await state.ready;
        expect(await earlyEvent).toBe(true);
        await secondState.ready;
        expect(secondState.isClosed()).toBe(true);
        expect(done).toHaveBeenCalledOnce();
        expect(changed).not.toHaveBeenCalled();
        expect(state.isEnabled()).toBe(false);
        expect(state.getLastPayload()).toEqual({ state: 42 });
        const save = state.setEnabled(true);
        expect(state.isEnabled()).toBe(true);
        await save;
    });
});
