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
            if (
                !this.nodeConfig.event_type ||
                this.nodeConfig.event_type === 'home_assistant_client'
            ) {
                this.addEventClientListener({
                    event: 'ha_events:states_loaded',
                    handler: this.onClientStatesLoaded.bind(this)
                });
                this.addEventClientListener({
                    event: 'ha_events:services_loaded',
                    handler: this.onClientServicesLoaded.bind(this)
                });
            }

            // Registering only needed event types
            this.nodeConfig.server.homeAssistant.registeredEvents[this.id] =
                this.nodeConfig.event_type || '__ALL__';
            this.updateEventList();
        }

        onHaEventsAll(evt) {
            this.send({
                event_type: evt.event_type,
                topic: evt.event_type,
                payload: evt
            });
            this.setStatusSuccess(evt.event_type);
        }

        clientEvent(type, data) {
            if (
                !this.nodeConfig.event_type ||
                this.nodeConfig.event_type === 'home_assistant_client'
            ) {
                this.send({
                    event_type: 'home_assistant_client',
                    topic: `home_assistant_client:${type}`,
                    payload: type,
                    data: data
                });

                if (type === 'states_loaded' || type === 'services_loaded') {
                    this.setStatusSuccess(type);
                }
            }
        }

        onClientStatesLoaded() {
            this.clientEvent('states_loaded');
        }

        onClientServicesLoaded() {
            this.clientEvent('services_loaded');
        }

        onClose(nodeRemoved) {
            super.onClose();

            if (nodeRemoved) {
                delete this.nodeConfig.server.homeAssistant.registeredEvents[
                    this.id
                ];
                this.updateEventList();
            }
        }

        onHaEventsClose() {
            super.onHaEventsClose();
            this.clientEvent('disconnected');
        }

        onHaEventsOpen() {
            super.onHaEventsOpen();
            this.clientEvent('connected');
        }

        onHaEventsConnecting() {
            super.onHaEventsConnecting();
            this.clientEvent('connecting');
        }

        onHaEventsError(err) {
            super.onHaEventsError(err);
            if (err) {
                this.clientEvent('error', err.message);
            }
        }

        updateEventList() {
            if (this.isConnected) {
                this.websocketClient.subscribeEvents(
                    this.nodeConfig.server.homeAssistant.registeredEvents
                );
            }
        }
    }

    RED.nodes.registerType('server-events', ServerEventsNode);
};
