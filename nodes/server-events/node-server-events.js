'use strict';
const nodeUtils = require('../../utils/node-utils');

const _int = {
    getSettings: function getSettings(config) {
        const settings = {};
        return settings;
    },
    getHandlers: function(node) {
        return {
            onEvent: (evt) => {
                node.send({ event_type: evt.event_type, topic: evt.event_type, payload: evt});
                nodeUtils.flashStatus(node, { status: { fill: 'green', shape: 'ring' }});
            },
            onClose: ()    => nodeUtils.setConnectionStatus(node, false),
            onOpen:  ()    => nodeUtils.setConnectionStatus(node, true),
            onError: (err) => nodeUtils.setConnectionStatus(node, false, err)
        };
    }
};

module.exports = function(RED) {
    function EventsAll(config) {
        const node = this;
        RED.nodes.createNode(node, config);

        node._state = {};
        node.settings = _int.getSettings(config);
        node.server = RED.nodes.getNode(config.server);

        // If the event source was setup start listening for events
        if (node.server) {
            nodeUtils.setConnectionStatus(node, node.server.events.connected);

            const handlers = _int.getHandlers(node);
            const eventsClient = node.server.events;

            eventsClient.on('ha_events:all',   handlers.onEvent);
            eventsClient.on('ha_events:close', handlers.onClose);
            eventsClient.on('ha_events:open',  handlers.onOpen);
            eventsClient.on('ha_events:error', handlers.onError);

            node.on('close', function(done) {
                eventsClient.removeListener('ha_events:all',   handlers.onEvent);
                eventsClient.removeListener('ha_events:close', handlers.onClose);
                eventsClient.removeListener('ha_events:open',  handlers.onOpen);
                eventsClient.removeListener('ha_events:error', handlers.onError);
                done();
            });
        } else {
            nodeUtils.setConnectionStatus(node, false);
        }
    }

    RED.nodes.registerType('server-events', EventsAll);
};
