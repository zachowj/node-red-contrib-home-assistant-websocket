'use strict';
const debug = require('debug')('ha-eventer:server-events');

const incomingEvents = {
    getSettings: function getSettings(config) {
        const settings = {
            eventTypeFilter:   config.eventtypefilter
        };

        return settings;
    },
    setStatus: function setStatus(isConnected, node) {
        if (isConnected) { node.status({ fill: 'green', shape: 'ring', text: 'Connected' }); }
        else { node.status({ fill: 'red', shape: 'ring', text: 'Disconnected' }) }
    }
};


module.exports = function(RED) {
    function EventsStateChange(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.settings = incomingEvents.getSettings(config);

        node.server = RED.nodes.getNode(config.server);
        incomingEvents.setStatus(false, node);

        // If the eventsource was setup start listening for events
        if (node.server) {
            if (node.server.connected) {  incomingEvents.setStatus(true, node); }
            const eventsClient = node.server.events;

            eventsClient.on(`ha_events:${node.settings.eventTypeFilter}`, (evt) => {
                node.send({ event_type: evt.event_type, topic: evt.event_type, payload: evt});
            });
            eventsClient.on('ha_events:close', () => incomingEvents.setStatus(false, node));
            eventsClient.on('ha_events:open', () => incomingEvents.setStatus(true, node));
            eventsClient.on('ha_events:error', (err) => {
                incomingEvents.setStatus(false, node);
                node.warn(err);
            });
        }
    }

    RED.nodes.registerType('server-events', EventsStateChange);
};
