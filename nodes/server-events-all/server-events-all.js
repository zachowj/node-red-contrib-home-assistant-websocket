const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    class ServerEventsNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED);
            this.addEventClientListener({ event: 'ha_events:all', handler: this.onHaEventsAll.bind(this) });
        }

        onHaEventsAll(evt) {
            this.send({ event_type: evt.event_type, topic: evt.event_type, payload: evt });
        }
    }

    RED.nodes.registerType('server-events', ServerEventsNode);
};
