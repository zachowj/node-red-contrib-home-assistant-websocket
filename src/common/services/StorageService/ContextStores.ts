export interface ContextStoreConfiguration {
    [name: string]: string | { module: unknown };
}

export interface ContextStores {
    defaultStore: string;
    stores: string[];
}

export function getContextStores(
    configuration?: ContextStoreConfiguration,
): ContextStores {
    if (!configuration || Object.keys(configuration).length === 0) {
        return { defaultStore: 'memory', stores: ['memory'] };
    }
    const stores = Object.keys(configuration).filter(
        (name) => name !== '_' && typeof configuration[name] !== 'string',
    );
    const configuredDefault = configuration.default;
    const defaultStore =
        typeof configuredDefault === 'string'
            ? configuredDefault
            : configuredDefault
              ? 'default'
              : stores[0];
    if (!defaultStore || !stores.includes(defaultStore)) {
        throw new Error('Invalid Node-RED context store configuration');
    }
    return { defaultStore, stores };
}

export function validateContextStore(
    store: string,
    configuration?: ContextStoreConfiguration,
): void {
    if (!getContextStores(configuration).stores.includes(store)) {
        throw new Error(`Unknown Node-RED context store: ${store}`);
    }
}

export function isKnownPersistentContextStore(
    store: string,
    configuration?: ContextStoreConfiguration,
): boolean {
    const config = configuration?.[store];
    return (
        !!config &&
        typeof config === 'object' &&
        config.module === 'localfilesystem'
    );
}

export function isKnownMemoryContextStore(
    store: string,
    configuration?: ContextStoreConfiguration,
): boolean {
    const config = configuration?.[store];
    return (
        store === 'memory' ||
        (!!config && typeof config === 'object' && config.module === 'memory')
    );
}

export function canConfirmContextStorePersistence(
    store: string,
    configuration?: ContextStoreConfiguration,
): boolean {
    const config = configuration?.[store];
    return (
        !!config &&
        typeof config === 'object' &&
        !isKnownPersistentContextStore(store, configuration) &&
        !isKnownMemoryContextStore(store, configuration)
    );
}
