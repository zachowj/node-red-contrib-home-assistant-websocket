import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { NodeContextData } from 'node-red';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PACKAGE_NAME } from '../../../../src/common/services/StorageService';
import ContextStorage from '../../../../src/common/services/StorageService/ContextStorage';
import {
    initializeContextStorage,
    MIGRATION_SETTING,
} from '../../../../src/common/services/StorageService/ContextStorageMigration';

const directories: string[] = [];

afterEach(async () => {
    await Promise.all(
        directories
            .splice(0)
            .map((directory) =>
                rm(directory, { recursive: true, force: true }),
            ),
    );
});

function createStorage() {
    let value: unknown;
    const context = {
        get: (
            _key: string,
            _store: string,
            callback: (error: null, value: unknown) => void,
        ) => callback(null, value),
        set: (
            _key: string,
            data: unknown,
            _store: string,
            callback: (error: null) => void,
        ) => {
            value = structuredClone(data);
            callback(null);
        },
    } as unknown as NodeContextData;
    return new ContextStorage(context, 'memory');
}

async function createDirectory() {
    const directory = await mkdtemp(join(tmpdir(), 'ha-context-test-'));
    directories.push(directory);
    return directory;
}

describe('context storage migration', () => {
    it('imports legacy data once without changing the original file', async () => {
        const directory = await createDirectory();
        const legacy = JSON.stringify({
            nodes: { node_1: { isEnabled: false } },
        });
        const filename = join(directory, `${PACKAGE_NAME}.json`);
        await writeFile(filename, legacy);
        const values = new Map<string, unknown>();
        const settings = {
            get: (key: string) => values.get(key),
            set: vi.fn(async (key: string, value: unknown) => {
                values.set(key, value);
            }),
        };
        const onLegacyImport = vi.fn();

        expect(
            await initializeContextStorage(
                createStorage(),
                settings,
                directory,
                true,
                onLegacyImport,
            ),
        ).toEqual({
            nodes: { node_1: { isEnabled: false } },
            issues: { hidden: [] },
        });
        expect(await readFile(filename, 'utf8')).toBe(legacy);
        expect(values.get(MIGRATION_SETTING)).toBe(true);
        expect(onLegacyImport).toHaveBeenCalledOnce();
        expect(
            await initializeContextStorage(
                createStorage(),
                settings,
                directory,
                true,
                onLegacyImport,
            ),
        ).toEqual({
            nodes: {},
            issues: { hidden: [] },
        });
        expect(onLegacyImport).toHaveBeenCalledOnce();
    });

    it('does not mark corrupt legacy data as migrated', async () => {
        const directory = await createDirectory();
        await writeFile(join(directory, `${PACKAGE_NAME}.json`), '{');
        const settings = { get: vi.fn(), set: vi.fn() };

        await expect(
            initializeContextStorage(
                createStorage(),
                settings,
                directory,
                true,
            ),
        ).rejects.toThrow();
        expect(settings.set).not.toHaveBeenCalled();
    });

    it('keeps migration pending after importing into an in-memory store', async () => {
        const directory = await createDirectory();
        const legacy = JSON.stringify({
            nodes: { node_1: { isEnabled: false } },
        });
        await writeFile(join(directory, `${PACKAGE_NAME}.json`), legacy);
        const values = new Map<string, unknown>();
        const settings = {
            get: (key: string) => values.get(key),
            set: vi.fn(async (key: string, value: unknown) => {
                values.set(key, value);
            }),
        };
        const storage = createStorage();
        const onLegacyImport = vi.fn();

        await initializeContextStorage(
            storage,
            settings,
            directory,
            false,
            onLegacyImport,
        );

        expect(onLegacyImport).toHaveBeenCalledOnce();
        expect(values.has(MIGRATION_SETTING)).toBe(false);
        expect(storage.getNode('node_1')).toEqual({ isEnabled: false });
    });

    it('preserves existing context data even when the legacy file is corrupt', async () => {
        const directory = await createDirectory();
        await writeFile(join(directory, `${PACKAGE_NAME}.json`), '{');
        const settings = {
            get: vi.fn(),
            set: vi.fn().mockResolvedValue(undefined),
        };
        const storage = createStorage();
        const existing = { nodes: {}, issues: { hidden: ['existing'] } };
        await storage.initialize(existing);

        expect(
            await initializeContextStorage(storage, settings, directory, true),
        ).toEqual(existing);
        expect(settings.set).toHaveBeenCalledWith(MIGRATION_SETTING, true);
    });
});
