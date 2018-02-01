const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            name:   {},
            server: { isNode: true }
        }
    };

    class ServerEventsNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            this.listeners = {
                onHaEventsAll:   this.onHaEventsAll.bind(this),
                onHaEventsClose: this.onHaEventsClose.bind(this),
                onHaEventsOpen:  this.onHaEventsOpen.bind(this),
                onHaEventsError: this.onHaEventsError.bind(this)
            };

            this.setConnectionStatus(this.isConnected);

            if (this.eventsClient) {
                this.eventsClient.addListener('ha_events:all',   this.listeners.onHaEventsAll);
                this.eventsClient.addListener('ha_events:close', this.listeners.onHaEventsClose);
                this.eventsClient.addListener('ha_events:open',  this.listeners.onHaEventsOpen);
                this.eventsClient.addListener('ha_events:error', this.listeners.onHaEventsError);
            }
        }

        onClose(nodeRemoved) {
            if (this.eventsClient) {
                this.eventsClient.removeListener('ha_events:all',   this.listeners.onHaEventsAll);
                this.eventsClient.removeListener('ha_events:close', this.listeners.onHaEventsClose);
                this.eventsClient.removeListener('ha_events:open',  this.listeners.onHaEventsOpen);
                this.eventsClient.removeListener('ha_events:error', this.listeners.onHaEventsError);
            }
        }

        onHaEventsAll(evt) {
            this.send({ event_type: evt.event_type, topic: evt.event_type, payload: evt });
            this.flashStatus();
        }
        onHaEventsClose() {
            this.setConnectionStatus(false);
        }
        onHaEventsOpen()  {
            this.setConnectionStatus(true);
        }

        onHaEventsError(err) {
            if (err.message) this.error(err.message);
        }

        setConnectionStatus(isConnected) {
            (isConnected)
                ? this.setStatus({ shape: 'dot', fill: 'green', text: 'connected'   })
                : this.setStatus({ shape: 'ring', fill: 'red', text: 'disconnected' });
        }

        get eventsClient() {
            return this.reach('nodeConfig.server.events');
        }

        get isConnected() {
            return this.eventsClient && this.eventsClient.connected;
        }
    }

    RED.nodes.registerType('server-events', ServerEventsNode);
};
