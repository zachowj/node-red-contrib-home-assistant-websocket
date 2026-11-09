import { readFile } from 'fs/promises';
import { join } from 'path';

import ContextStorage from './ContextStorage';
import { PACKAGE_NAME, StorageData } from './types';

export const MIGRATION_SETTING = `${PACKAGE_NAME}.contextMigrationComplete`;

interface Settings {
    get(key: string): unknown;
    set(key: string, value: unknown): Promise<void>;
}

function parseLegacyData(contents: string): StorageData {
    const data: unknown = JSON.parse(contents);
    if (
        !data ||
        typeof data !== 'object' ||
        !('nodes' in data) ||
        !data.nodes ||
        typeof data.nodes !== 'object' ||
        Array.isArray(data.nodes)
    ) {
        throw new Error('Invalid Home Assistant legacy storage data');
    }
    const issues = 'issues' in data ? data.issues : undefined;
    if (
        issues !== undefined &&
        (!issues ||
            typeof issues !== 'object' ||
            !('hidden' in issues) ||
            !Array.isArray(issues.hidden) ||
            !issues.hidden.every((issue: unknown) => typeof issue === 'string'))
    ) {
        throw new Error('Invalid Home Assistant legacy issues data');
    }
    return {
        nodes: data.nodes as StorageData['nodes'],
        issues: (issues as StorageData['issues'] | undefined) ?? { hidden: [] },
    };
}

export async function initializeContextStorage(
    storage: ContextStorage,
    settings: Settings,
    userDir: string,
    persistentStore: boolean,
    onLegacyImport?: () => void,
): Promise<StorageData> {
    const existing = await storage.load();
    if (existing) {
        if (persistentStore && !settings.get(MIGRATION_SETTING)) {
            await settings.set(MIGRATION_SETTING, true);
        }
        return existing;
    }

    let data: StorageData = { nodes: {}, issues: { hidden: [] } };
    let importedLegacy = false;
    const migrated = settings.get(MIGRATION_SETTING) === true;
    if (!migrated) {
        try {
            const contents = await readFile(
                join(userDir, `${PACKAGE_NAME}.json`),
                'utf8',
            );
            data = parseLegacyData(contents);
            importedLegacy = true;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }
    await storage.initialize(data);
    if (importedLegacy) onLegacyImport?.();
    if (!migrated && persistentStore) {
        await settings.set(MIGRATION_SETTING, true);
    }
    return data;
}
