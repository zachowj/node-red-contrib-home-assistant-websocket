const EventsHaNode = require('../EventsHaNode');
const isMatch = require('lodash.ismatch');

const nodeOptions = {
    config: {
        eventType: (nodeDef) => (nodeDef.eventType || '').trim(),
        waitForRunning: {},
        outputProperties: {},
        eventData: {},
    },
};

class EventsAll extends EventsHaNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });

        if (this.nodeConfig.eventData) {
            try {
                this.eventData = JSON.parse(this.nodeConfig.eventData);
            } catch (e) {
                this.status.setFailed(
                    this.RED._('home-assistant.status.error')
                );
                throw new Error(this.RED._('server-events.error.invalid_json'));
            }
        }

        const type = this.nodeConfig.eventType || 'all';
        this.addEventClientListener(
            `ha_events:${type}`,
            this.onHaEventsAll.bind(this)
        );
        if (
            !this.nodeConfig.event_type ||
            this.nodeConfig.event_type === 'home_assistant_client'
        ) {
            const clientEvents = [
                ['ha_client:states_loaded', this.onClientStatesLoaded],
                ['ha_client:services_loaded', this.onClientServicesLoaded],
                ['ha_client:running', this.onHaEventsRunning],
                ['ha_client:ready', this.onHaEventsReady],
            ];

            clientEvents.forEach(([event, callback]) => {
                this.addEventClientListener(event, callback.bind(this));
            });
        }

        // Registering only needed event types
        if (this.homeAssistant) {
            this.homeAssistant.eventsList[this.node.id] =
                this.nodeConfig.eventType || '__ALL__';
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

        // Compare event data
        if (this.eventData && !isMatch(evt.event, this.eventData)) return;

        const message = {};
        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                eventData: evt,
            });
        } catch (e) {
            this.status.setFailed(this.RED._('home-assistant.status.errror'));
            return;
        }

        this.status.setSuccess(evt.event_type);
        this.send(message);
    }

    clientEvent(type, data) {
        if (this.isEnabled === false) return;

        if (
            !this.nodeConfig.eventType ||
            this.nodeConfig.eventType === 'home_assistant_client'
        ) {
            this.send({
                event_type: 'home_assistant_client',
                topic: `home_assistant_client:${type}`,
                payload: type,
                data,
            });

            if (type === 'states_loaded' || type === 'services_loaded') {
                this.status.setSuccess(type);
            }
        }
    }

    onClose(nodeRemoved) {
        super.onClose(nodeRemoved);

        const type = `ha_events:${this.nodeConfig.eventType || 'all'}`;
        this.homeAssistant.removeListener(type, this.onHaEventsAll.bind(this));
        if (nodeRemoved) {
            delete this.homeAssistant.eventsList[this.node.id];
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
        this.clientEvent('running');
    }

    onHaEventsReady() {
        this.clientEvent('ready');
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
            this.homeAssistant.subscribeEvents();
        }
    }
}

module.exports = EventsAll;
