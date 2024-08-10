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

export function subscribeAreaRegistry(
    conn: Connection,
    cb: (state: HassAreas) => void,
): Collection<HassAreas> {
    const fetchAreaRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassAreas>({
            type: 'config/area_registry/list',
        });

    const subscribeUpdates = (conn: Connection, store: Store<HassAreas>) =>
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchAreaRegistry(conn).then((areas) =>
                        store.setState(areas, true),
                    ),
                500,
            ),
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
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchDeviceRegistry(conn).then((devices) =>
                        store.setState(devices, true),
                    ),
                500,
            ),
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
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchEntityRegistry(conn).then((devices) =>
                        store.setState(devices, true),
                    ),
                500,
            ),
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
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchFloorRegistry(conn).then((floors) =>
                        store.setState(floors, true),
                    ),
                500,
            ),
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
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchLabelRegistry(conn).then((labels) =>
                        store.setState(labels, true),
                    ),
                500,
            ),
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
