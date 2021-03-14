const EventsHaNode = require('./EventsHaNode');

const nodeOptions = {
    config: {
        event_type: (nodeDef) => (nodeDef.event_type || '').trim(),
        waitForRunning: {},
        outputProperties: {},
    },
};

class EventsAll extends EventsHaNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });

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
            this.addEventClientListener(
                'ha_client:running',
                this.onHaEventsRunning.bind(this)
            );
        }

        // Registering only needed event types
        if (this.homeAssistant) {
            this.homeAssistant.eventsList[this.node.id] =
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

        const message = {};
        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                eventData: evt,
            });
        } catch (e) {
            this.status.setFailed('error');
            return;
        }

        this.status.setSuccess(evt.event_type);
        this.send(message);
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
                this.status.setSuccess(type);
            }
        }
    }

    onClose(nodeRemoved) {
        super.onClose(nodeRemoved);

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
