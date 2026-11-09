import { NodeAPI } from 'node-red';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import storageService from '../../src/common/services/StorageService';
import { setRED } from '../../src/globals';
import { createRoutes } from '../../src/routes';

vi.mock('../../src/common/services/StorageService', () => ({
    default: {
        getStoreInfo: vi.fn(() => ({
            stores: ['memory', 'disk'],
            selectedStore: 'memory',
            defaultStore: 'memory',
            ready: true,
            failed: false,
        })),
        setStore: vi.fn().mockResolvedValue(undefined),
    },
}));

describe('storage routes', () => {
    const routes = new Map<string, (...args: any[]) => any>();
    const needsPermission = vi.fn(() => () => undefined);

    beforeEach(() => {
        routes.clear();
        vi.clearAllMocks();
        setRED({
            auth: { needsPermission },
            httpAdmin: {
                get: (path: string, ...handlers: ((...args: any[]) => any)[]) =>
                    routes.set(`GET ${path}`, handlers.at(-1)!),
                post: (
                    path: string,
                    ...handlers: ((...args: any[]) => any)[]
                ) => routes.set(`POST ${path}`, handlers.at(-1)!),
            },
            log: { error: vi.fn() },
        } as unknown as NodeAPI);
        createRoutes();
    });

    it('requires flow read and write permissions', () => {
        expect(needsPermission).toHaveBeenCalledWith('flows.read');
        expect(needsPermission).toHaveBeenCalledWith('flows.write');
        expect(routes.has('GET /homeassistant/storage')).toBe(true);
        expect(routes.has('POST /homeassistant/storage')).toBe(true);
    });

    it('rejects unknown store names without changing storage', async () => {
        const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        await routes.get('POST /homeassistant/storage')!(
            { body: { store: 'unknown' } },
            response,
        );
        expect(response.status).toHaveBeenCalledWith(400);
        expect(storageService.setStore).not.toHaveBeenCalled();
    });

    it('returns an error when the store cannot be changed', async () => {
        vi.mocked(storageService.setStore).mockRejectedValueOnce(
            new Error('failed'),
        );
        const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        await routes.get('POST /homeassistant/storage')!(
            { body: { store: 'disk' } },
            response,
        );
        expect(response.status).toHaveBeenCalledWith(500);
    });

    it('forwards persistence confirmation for a custom store', async () => {
        const response = { json: vi.fn() };
        await routes.get('POST /homeassistant/storage')!(
            { body: { store: 'disk', persistentAcknowledged: true } },
            response,
        );
        expect(storageService.setStore).toHaveBeenCalledWith('disk', true);
    });
});
