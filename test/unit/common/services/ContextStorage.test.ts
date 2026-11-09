import { NodeContextData } from 'node-red';
import { describe, expect, it, vi } from 'vitest';

import { StorageData } from '../../../../src/common/services/StorageService';
import ContextStorage, {
    CONTEXT_KEY,
} from '../../../../src/common/services/StorageService/ContextStorage';

function createContext() {
    const stores = new Map<string | undefined, StorageData>();
    const context = {
        get: vi.fn((_key, store, callback) => {
            queueMicrotask(() => callback(null, stores.get(store)));
        }),
        set: vi.fn((_key, value, store, callback) => {
            queueMicrotask(() => {
                stores.set(store, structuredClone(value));
                callback(null);
            });
        }),
    } as unknown as NodeContextData;
    return { context, stores };
}

describe('ContextStorage', () => {
    it('serializes asynchronous updates and store switches', async () => {
        const { context, stores } = createContext();
        const storage = new ContextStorage(context, 'memory');
        expect(await storage.load()).toBeUndefined();
        await storage.initialize({ nodes: {}, issues: { hidden: [] } });

        const updateNode = storage.update((data) => {
            data.nodes.node_1 = {
                isEnabled: false,
                lastPayload: { state: 42 },
            };
        });
        const saveSelection = vi.fn().mockResolvedValue(undefined);
        const switchStore = storage.switchStore('disk', saveSelection);
        const updateIssues = storage.update((data) => {
            data.issues.hidden.push('issue');
        });
        await Promise.all([updateNode, switchStore, updateIssues]);

        expect(saveSelection).toHaveBeenCalledOnce();
        expect(stores.get('memory')?.issues.hidden).toEqual([]);
        expect(stores.get('disk')).toEqual({
            nodes: { node_1: { isEnabled: false, lastPayload: { state: 42 } } },
            issues: { hidden: ['issue'] },
        });
        const node = storage.getNode('node_1');
        expect(node).toEqual(stores.get('disk')?.nodes.node_1);
        node!.isEnabled = true;
        const issues = storage.getIssues();
        issues.push('not stored');
        expect(storage.getNode('node_1')?.isEnabled).toBe(false);
        expect(storage.getIssues()).toEqual(['issue']);
        expect(context.set).toHaveBeenCalledWith(
            CONTEXT_KEY,
            expect.any(Object),
            'disk',
            expect.any(Function),
        );
    });

    it('continues using the original store when saving the selection fails', async () => {
        const { context, stores } = createContext();
        const storage = new ContextStorage(context, 'memory');
        await storage.initialize({ nodes: {}, issues: { hidden: [] } });

        await expect(
            storage.switchStore('disk', async () => {
                throw new Error('settings failed');
            }),
        ).rejects.toThrow('settings failed');
        await storage.update((data) => data.issues.hidden.push('issue'));

        expect(stores.get('memory')?.issues.hidden).toEqual(['issue']);
        expect(stores.get('disk')?.issues.hidden).toEqual([]);
    });

    it('does not switch stores when the destination write fails', async () => {
        const { context, stores } = createContext();
        const storage = new ContextStorage(context, 'memory');
        await storage.initialize({ nodes: {}, issues: { hidden: [] } });
        const set = vi.mocked(context.set);
        set.mockImplementationOnce(((
            _key: string,
            _value: unknown,
            _store: string,
            callback: (error: Error) => void,
        ) => {
            callback(new Error('disk unavailable'));
        }) as typeof context.set);
        const saveSelection = vi.fn().mockResolvedValue(undefined);

        await expect(
            storage.switchStore('disk', saveSelection),
        ).rejects.toThrow('disk unavailable');
        await storage.update((data) => data.issues.hidden.push('issue'));

        expect(saveSelection).not.toHaveBeenCalled();
        expect(stores.get('memory')?.issues.hidden).toEqual(['issue']);
        expect(stores.has('disk')).toBe(false);
    });

    it('rejects invalid stored data instead of treating it as empty', async () => {
        const { context } = createContext();
        vi.mocked(context.get).mockImplementationOnce(((
            _key: string,
            _store: string,
            callback: (error: null, value: unknown) => void,
        ) => {
            callback(null, { nodes: {}, issues: { hidden: 'invalid' } });
        }) as typeof context.get);

        await expect(
            new ContextStorage(context, 'memory').load(),
        ).rejects.toThrow('Invalid Home Assistant context storage data');
    });
});
