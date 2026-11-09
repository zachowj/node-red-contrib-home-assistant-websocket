import { describe, expect, it } from 'vitest';

import {
    canConfirmContextStorePersistence,
    getContextStores,
    isKnownMemoryContextStore,
    isKnownPersistentContextStore,
    validateContextStore,
} from '../../../../src/common/services/StorageService/ContextStores';

describe('Node-RED context stores', () => {
    it('uses the implicit memory store without configuration', () => {
        expect(getContextStores()).toEqual({
            defaultStore: 'memory',
            stores: ['memory'],
        });
    });

    it('resolves default aliases and preserves the configured store names', () => {
        const configuration = {
            default: 'disk',
            memory: { module: 'memory' },
            disk: { module: 'localfilesystem' },
        };
        expect(getContextStores(configuration)).toEqual({
            defaultStore: 'disk',
            stores: ['memory', 'disk'],
        });
        expect(() => validateContextStore('missing', configuration)).toThrow(
            'Unknown Node-RED context store',
        );
    });

    it('uses the first configured store when there is no default', () => {
        expect(
            getContextStores({
                disk: { module: 'localfilesystem' },
                memory: { module: 'memory' },
            }).defaultStore,
        ).toBe('disk');
    });

    it('supports a store named default', () => {
        expect(getContextStores({ default: { module: 'memory' } })).toEqual({
            defaultStore: 'default',
            stores: ['default'],
        });
    });

    it('only treats configured localfilesystem stores as persistence-confirmed', () => {
        const configuration = {
            memory: { module: 'memory' },
            disk: { module: 'localfilesystem' },
            custom: { module: 'custom-store' },
        };
        expect(isKnownPersistentContextStore('memory', configuration)).toBe(
            false,
        );
        expect(isKnownPersistentContextStore('disk', configuration)).toBe(true);
        expect(isKnownPersistentContextStore('custom', configuration)).toBe(
            false,
        );
        expect(isKnownPersistentContextStore('memory')).toBe(false);
    });

    it('allows explicit persistence confirmation only for custom stores', () => {
        const configuration = {
            memory: { module: 'memory' },
            disk: { module: 'localfilesystem' },
            custom: { module: 'custom-store' },
        };
        expect(isKnownMemoryContextStore('memory', configuration)).toBe(true);
        expect(isKnownMemoryContextStore('custom', configuration)).toBe(false);
        expect(canConfirmContextStorePersistence('memory', configuration)).toBe(
            false,
        );
        expect(canConfirmContextStorePersistence('disk', configuration)).toBe(
            false,
        );
        expect(canConfirmContextStorePersistence('custom', configuration)).toBe(
            true,
        );
    });
});
