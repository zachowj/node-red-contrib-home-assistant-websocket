// eslint-disable-next-line no-unused-vars
const haData = ((RED) => {
    const entities = {};
    const devices = {};

    RED.comms.subscribe('homeassistant/devices/#', (topic, data) => {
        const serverId = parseServerId(topic);
        devices[serverId] = data;
    });

    RED.comms.subscribe('homeassistant/entity/#', (topic, data) => {
        const serverId = parseServerId(topic);
        if (!entities[serverId]) entities[serverId] = {};
        entities[serverId][data.entity_id] = data;
    });

    RED.comms.subscribe('homeassistant/entities/#', (topic, data) => {
        const serverId = parseServerId(topic);
        entities[serverId] = data;
    });

    function parseServerId(topic) {
        const parts = topic.split('/');
        return parts[2];
    }

    function getAutocomplete(serverId, type) {
        let list = [];
        switch (type) {
            case 'entities':
                if (!(serverId in entities)) return [];
                list = Object.keys(entities[serverId]).sort();
                break;
        }

        return list;
    }

    function getDevices(serverId) {
        return devices[serverId];
    }

    function getEntity(serverId, entityId) {
        return entities[serverId][entityId];
    }

    function getProperties(serverId, entityId) {
        if (!(serverId in entities)) return [];

        const flat =
            entityId in entities[serverId]
                ? Object.keys(flatten(entities[serverId][entityId]))
                : Object.values(entities[serverId]).map((entity) =>
                      Object.keys(flatten(entity))
                  );
        const uniqProperties = [...new Set([].concat(...flat))];
        const sortedProperties = uniqProperties.sort((a, b) => {
            if (!a.includes('.') && b.includes('.')) return -1;
            if (a.includes('.') && !b.includes('.')) return 1;
            if (a < b) return -1;
            if (a > b) return 1;

            return 0;
        });

        return sortedProperties;
    }

    function flatten(object, path = null, separator = '.') {
        return Object.keys(object).reduce((acc, key) => {
            const value = object[key];
            const newPath = [path, key].filter(Boolean).join(separator);
            const isObject = [
                typeof value === 'object',
                value !== null,
                !(value instanceof Date),
                !(value instanceof RegExp),
                !(Array.isArray(value) && value.length === 0),
            ].every(Boolean);

            return isObject
                ? { ...acc, ...flatten(value, newPath, separator) }
                : { ...acc, [newPath]: value };
        }, {});
    }

    return {
        getAutocomplete,
        getDevices,
        getEntity,
        getProperties,
    };

    // eslint-disable-next-line no-undef
})(RED);
