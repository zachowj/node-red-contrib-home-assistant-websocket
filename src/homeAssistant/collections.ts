import {
    Collection,
    Connection,
    getCollection,
} from 'home-assistant-js-websocket';
import { Store } from 'home-assistant-js-websocket/dist/store';
import { throttle } from 'lodash';

import {
    HassAreas,
    HassDevices,
    HassEntityRegistryEntry,
    HassFloor,
    HassLabel,
} from '../types/home-assistant';

function subscribeRegistryUpdates<T>(
    conn: Connection,
    store: Store<T>,
    fetchRegistry: (conn: Connection) => Promise<T>,
    eventType: string,
) {
    return conn.subscribeEvents(
        throttle(
            () =>
                fetchRegistry(conn)
                    .then((state) => store.setState(state, true))
                    .catch((error: unknown) => {
                        if (conn.connected) {
                            throw error;
                        }
                    }),
            500,
        ),
        eventType,
    );
}

export function subscribeAreaRegistry(
    conn: Connection,
    cb: (state: HassAreas) => void,
): Collection<HassAreas> {
    const fetchAreaRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassAreas>({
            type: 'config/area_registry/list',
        });

    const subscribeUpdates = (conn: Connection, store: Store<HassAreas>) =>
        subscribeRegistryUpdates(
            conn,
            store,
            fetchAreaRegistry,
            'area_registry_updated',
        );

    const collection = getCollection(
        conn,
        '_areas',
        fetchAreaRegistry,
        subscribeUpdates,
    );
    collection.subscribe(cb);

    return collection;
}

export function subscribeDeviceRegistry(
    conn: Connection,
    cb: (state: HassDevices) => void,
): void {
    const fetchDeviceRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassDevices>({
            type: 'config/device_registry/list',
        });

    const subscribeUpdates = (conn: Connection, store: Store<HassDevices>) =>
        subscribeRegistryUpdates(
            conn,
            store,
            fetchDeviceRegistry,
            'device_registry_updated',
        );

    const collection = getCollection(
        conn,
        '_devices',
        fetchDeviceRegistry,
        subscribeUpdates,
    );
    collection.subscribe(cb);
}

export function subscribeEntityRegistry(
    conn: Connection,
    cb: (state: HassEntityRegistryEntry[]) => void,
): void {
    const fetchEntityRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassEntityRegistryEntry[]>({
            type: 'config/entity_registry/list',
        });

    const subscribeUpdates = (
        conn: Connection,
        store: Store<HassEntityRegistryEntry[]>,
    ) =>
        subscribeRegistryUpdates(
            conn,
            store,
            fetchEntityRegistry,
            'entity_registry_updated',
        );

    const collection = getCollection(
        conn,
        '_entity',
        fetchEntityRegistry,
        subscribeUpdates,
    );
    collection.subscribe(cb);
}

export function subscribeFloorRegistry(
    conn: Connection,
    cb: (state: HassFloor[]) => void,
): void {
    const fetchFloorRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassFloor[]>({
            type: 'config/floor_registry/list',
        });

    const subscribeUpdates = (conn: Connection, store: Store<HassFloor[]>) =>
        subscribeRegistryUpdates(
            conn,
            store,
            fetchFloorRegistry,
            'floor_registry_updated',
        );

    const collection = getCollection(
        conn,
        '_floors',
        fetchFloorRegistry,
        subscribeUpdates,
    );
    collection.subscribe(cb);
}

export function subscribeLabelRegistry(
    conn: Connection,
    cb: (state: HassLabel[]) => void,
): void {
    const fetchLabelRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassLabel[]>({
            type: 'config/label_registry/list',
        });

    const subscribeUpdates = (conn: Connection, store: Store<HassLabel[]>) =>
        subscribeRegistryUpdates(
            conn,
            store,
            fetchLabelRegistry,
            'label_registry_updated',
        );

    const collection = getCollection(
        conn,
        '_labels',
        fetchLabelRegistry,
        subscribeUpdates,
    );
    collection.subscribe(cb);
}
