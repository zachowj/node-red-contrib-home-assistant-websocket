const { getCollection } = require('home-assistant-js-websocket');

function subscribeDeviceRegistry(conn, cb) {
    const fetchDeviceRegistry = (conn) =>
        conn.sendMessagePromise({
            type: 'config/device_registry/list',
        });

    const subscribeUpdates = (conn, store) =>
        conn.subscribeEvents(async () => {
            const devices = await fetchDeviceRegistry(conn);
            store.setState(devices, true);
        }, 'device_registry_updated');

    const collection = getCollection(
        conn,
        '_devices',
        fetchDeviceRegistry,
        subscribeUpdates
    );
    collection.subscribe(cb);
}

module.exports = {
    subscribeDeviceRegistry,
};
