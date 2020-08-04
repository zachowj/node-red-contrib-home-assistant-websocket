const selectn = require('selectn');

const EventsHaNode = require('../../lib/events-ha-node');

module.exports = function (RED) {
    const nodeOptions = {
        config: {
            event_type: {},
            waitForRunning: (nodeDef) => nodeDef.waitForRunning || true,
        },
    };

    class ServerEventsNode extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            this.addEventClientListener(
                'ha_events:' + (this.nodeConfig.event_type || 'all'),
                this.onHaEventsAll.bind(this)
            );
            if (
                !this.nodeConfig.event_type ||
                this.nodeConfig.event_type === 'home_assistant_client'
            ) {
                this.addEventClientListener(
                    'ha_client:states_loaded',
                    this.onClientStatesLoaded.bind(this)
                );
                this.addEventClientListener(
                    'ha_client:services_loaded',
                    this.onClientServicesLoaded.bind(this)
                );
            }

            // Registering only needed event types
            if (selectn('nodeConfig.server.homeAssistant', this)) {
                this.nodeConfig.server.homeAssistant.eventsList[this.id] =
                    this.nodeConfig.event_type || '__ALL__';
                this.updateEventList();
            }
        }

        onHaEventsAll(evt) {
            if (this.isEnabled === false) return;

            if (
                !this.isHomeAssistantRunning &&
                this.nodeConfig.waitForRunning === true
            ) {
                return;
            }

            this.send({
                event_type: evt.event_type,
                topic: evt.event_type,
                payload: evt,
            });
            this.setStatusSuccess(evt.event_type);
        }

        clientEvent(type, data) {
            if (this.isEnabled === false) return;

            if (
                !this.nodeConfig.event_type ||
                this.nodeConfig.event_type === 'home_assistant_client'
            ) {
                this.send({
                    event_type: 'home_assistant_client',
                    topic: `home_assistant_client:${type}`,
                    payload: type,
                    data: data,
                });

                if (type === 'states_loaded' || type === 'services_loaded') {
                    this.setStatusSuccess(type);
                }
            }
        }

        onClose(nodeRemoved) {
            super.onClose(nodeRemoved);

            if (nodeRemoved) {
                delete this.nodeConfig.server.homeAssistant.eventsList[this.id];
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

        onHaEventsRunning() {
            super.onHaEventsRunning();
            this.clientEvent('running');
        }

        onHaEventsError(err) {
            super.onHaEventsError(err);
            if (err) {
                this.clientEvent('error', err.message);
            }
        }

        onClientStatesLoaded() {
            this.clientEvent('states_loaded');
        }

        onClientServicesLoaded() {
            this.clientEvent('services_loaded');
        }

        updateEventList() {
            if (this.isConnected) {
                this.websocketClient.subscribeEvents(
                    this.nodeConfig.server.homeAssistant.eventsList
                );
            }
        }
    }

    RED.nodes.registerType('server-events', ServerEventsNode);
};
