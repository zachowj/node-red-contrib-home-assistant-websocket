const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            event_type: {}
        }
    };

    class ServerEventsNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.addEventClientListener({
                event: 'ha_events:' + (this.nodeConfig.event_type || 'all'),
                handler: this.onHaEventsAll.bind(this)
            });
        }

        onHaEventsAll(evt) {
            this.send({
                event_type: evt.event_type,
                topic: evt.event_type,
                payload: evt
            });
            this.status({
                fill: 'green',
                shape: 'dot',
                text: `${evt.event_type} at: ${this.getPrettyDate()}`
            });
        }
    }

    RED.nodes.registerType('server-events', ServerEventsNode);
};
