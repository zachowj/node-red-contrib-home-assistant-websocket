import { Connection, getCollection } from 'home-assistant-js-websocket';
import { Store } from 'home-assistant-js-websocket/dist/store';
import { throttle } from 'lodash';

import {
    HassAreas,
    HassDevices,
    HassEntityRegistryDisplayEntryResponse,
    HassEntityRegistryEntry,
} from '../types/home-assistant';

export function subscribeAreaRegistry(
    conn: Connection,
    cb: (state: HassAreas) => void
): void {
    const fetchAreaRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassAreas>({
            type: 'config/area_registry/list',
        });

    const subscribeUpdates = (conn: Connection, store: Store<HassAreas>) =>
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchAreaRegistry(conn).then((areas) =>
                        store.setState(areas, true)
                    ),
                500
            ),
            'area_registry_updated'
        );

    const collection = getCollection(
        conn,
        '_areas',
        fetchAreaRegistry,
        subscribeUpdates
    );
    collection.subscribe(cb);
}

export function subscribeDeviceRegistry(
    conn: Connection,
    cb: (state: HassDevices) => void
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
                        store.setState(devices, true)
                    ),
                500
            ),
            'device_registry_updated'
        );

    const collection = getCollection(
        conn,
        '_devices',
        fetchDeviceRegistry,
        subscribeUpdates
    );
    collection.subscribe(cb);
}

export function subscribeEntityRegistry(
    conn: Connection,
    cb: (state: HassEntityRegistryEntry[]) => void
): void {
    const fetchEntityRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassEntityRegistryEntry[]>({
            type: 'config/entity_registry/list',
        });

    const subscribeUpdates = (
        conn: Connection,
        store: Store<HassEntityRegistryEntry[]>
    ) =>
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchEntityRegistry(conn).then((devices) =>
                        store.setState(devices, true)
                    ),
                500
            ),
            'entity_registry_updated'
        );

    const collection = getCollection(
        conn,
        '_entity',
        fetchEntityRegistry,
        subscribeUpdates
    );
    collection.subscribe(cb);
}

export function subscribeEntityRegistryDisplay(
    conn: Connection,
    cb: (state: HassEntityRegistryDisplayEntryResponse) => void
): void {
    const fetchEntityRegistry = (conn: Connection) =>
        conn.sendMessagePromise<HassEntityRegistryDisplayEntryResponse>({
            type: 'config/entity_registry/list_for_display',
        });

    const subscribeUpdates = (
        conn: Connection,
        store: Store<HassEntityRegistryDisplayEntryResponse>
    ) =>
        conn.subscribeEvents(
            throttle(
                () =>
                    fetchEntityRegistry(conn).then((devices) =>
                        store.setState(devices, true)
                    ),
                500
            ),
            'entity_registry_updated'
        );

    const collection = getCollection(
        conn,
        '_entityRegistryDisplay',
        fetchEntityRegistry,
        subscribeUpdates
    );
    collection.subscribe(cb);
}
