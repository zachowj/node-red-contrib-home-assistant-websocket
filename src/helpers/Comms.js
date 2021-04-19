const selectn = require('selectn');

const { HA_EVENT_DEVICE_REGISTRY_UPDATED } = require('../const');

class Comms {
    constructor(RED, homeAssistant, serverId) {
        this.RED = RED;
        this.homeAssistant = homeAssistant;
        this.serverId = serverId;

        this.startListeners();
    }

    startListeners() {
        // Setup event listeners
        const events = {
            'ha_client:services_loaded': this.onServicesLoaded,
            'ha_client:states_loaded': this.onStatesLoaded,
            'ha_events:state_changed': this.onStateChanged,
            integration: this.onIntegrationEvent,
            [HA_EVENT_DEVICE_REGISTRY_UPDATED]: this.onDevicesUpdated,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.homeAssistant.addListener(event, callback.bind(this))
        );
    }

    publish(type, data, retain = true) {
        this.RED.comms.publish(
            `homeassistant/${type}/${this.serverId}`,
            data,
            retain
        );
    }

    onDevicesUpdated(devices) {
        this.publish('devices', devices);
    }

    onIntegrationEvent(eventType) {
        this.publish('integration', {
            event: eventType,
            version: this.homeAssistant.integrationVersion,
        });
    }

    onServicesLoaded(services) {}

    onStateChanged(event) {
        const entity = selectn('event.new_state', event);
        if (entity) {
            this.publish('entity', entity);
        }
    }

    onStatesLoaded(entities) {
        this.publish('entities', entities);
    }
}

module.exports = Comms;
