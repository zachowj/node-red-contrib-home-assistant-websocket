const merge = require('lodash.merge');
const BaseNode = require('./base-node');

const DEFAULT_NODE_OPTIONS = {
    debug: false,
    config: {
        name: {},
        server: { isNode: true }
    }
};

class EventsNode extends BaseNode {
    constructor(nodeDefinition, RED, nodeOptions = {}) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super(nodeDefinition, RED, nodeOptions);
        this.listeners = {};

        this.addEventClientListener({
            event: 'ha_events:close',
            handler: this.onHaEventsClose.bind(this)
        });
        this.addEventClientListener({
            event: 'ha_events:open',
            handler: this.onHaEventsOpen.bind(this)
        });
        this.addEventClientListener({
            event: 'ha_events:error',
            handler: this.onHaEventsError.bind(this)
        });
        this.addEventClientListener({
            event: 'ha_events:connecting',
            handler: this.onHaEventsConnecting.bind(this)
        });

        this.updateConnectionStatus();
    }

    addEventClientListener({ event, handler }) {
        this.listeners[event] = handler;
        this.eventsClient.addListener(event, handler);
    }

    onClose(nodeRemoved) {
        if (this.eventsClient) {
            Object.entries(this.listeners).forEach(([event, handler]) => {
                this.eventsClient.removeListener(event, handler);
            });
        }
    }

    onHaEventsClose() {
        this.updateConnectionStatus();
    }

    onHaEventsOpen() {
        this.updateConnectionStatus();
    }

    onHaEventsConnecting() {
        this.updateConnectionStatus();
    }

    onHaEventsError(err) {
        if (err.message) this.error(err.message);
    }
}

module.exports = EventsNode;
