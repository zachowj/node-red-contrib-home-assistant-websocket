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

    function getDevices(serverId) {
        return devices[serverId];
    }

    function getEntity(serverId, entityId) {
        return entities[serverId][entityId];
    }

    return {
        getDevices: getDevices,
        getEntity: getEntity,
    };

    // eslint-disable-next-line no-undef
})(RED);
