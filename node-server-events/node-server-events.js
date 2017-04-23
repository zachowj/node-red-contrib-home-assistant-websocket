'use strict';
const debug = require('debug')('home-assistant:server-events');

const incomingEvents = {
    getSettings: function getSettings(config) {
        const settings = {}
        return settings;
    },
    setStatus: function setStatus(isConnected, node) {
        if (isConnected) { node.status({ fill: 'green', shape: 'ring', text: 'Connected' }); }
        else { node.status({ fill: 'red', shape: 'ring', text: 'Disconnected' }) }
    },
    handlers: {
        onEvent: (evt) => {
            incomingEvents.node.send({ event_type: evt.event_type, topic: evt.event_type, payload: evt});
        },
        onClose: () => {
            incomingEvents.setStatus(false, incomingEvents.node)
        },
        onOpen: () => {
            incomingEvents.setStatus(true, incomingEvents.node)
        },
        onError: (err) => {
            incomingEvents.setStatus(false, incomingEvents.node)
        }
    }
};


module.exports = function(RED) {
    function EventsAll(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        incomingEvents.node = node;
        node.settings = incomingEvents.getSettings(config);

        node.server = RED.nodes.getNode(config.server);
        incomingEvents.setStatus(false, node);

        // If the event source was setup start listening for events
        if (node.server) {
            if (node.server.connected) {  incomingEvents.setStatus(true, node); }
            const eventsClient = node.server.events;

            eventsClient.on('ha_events:all',   incomingEvents.handlers.onEvent);
            eventsClient.on('ha_events:close', incomingEvents.handlers.onClose);
            eventsClient.on('ha_events:open',  incomingEvents.handlers.onOpen);
            eventsClient.on('ha_events:error', incomingEvents.handlers.onError);

            this.on('close', function(done) {
                eventsClient.removeListener('ha_events:all',   incomingEvents.handlers.onEvent);
                eventsClient.removeListener('ha_events:close', incomingEvents.handlers.onClose);
                eventsClient.removeListener('ha_events:open',  incomingEvents.handlers.onOpen);
                eventsClient.removeListener('ha_events:error', incomingEvents.handlers.onError);
                done();
            });
        }
    }

    RED.nodes.registerType('server-events', EventsAll);
};
