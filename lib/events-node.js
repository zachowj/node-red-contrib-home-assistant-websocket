const merge = require('lodash.merge');

const BaseNode = require('./base-node');
const {
    INTEGRATION_EVENT,
    INTEGRATION_LOADED,
    INTEGRATION_UNLOADED,
    INTEGRATION_NOT_LOADED,
} = require('./const');

const DEFAULT_NODE_OPTIONS = {
    debug: false,
    config: {
        name: {},
        server: { isNode: true },
        exposeToHomeAssistant: (nodeDef) =>
            nodeDef.exposeToHomeAssistant === undefined
                ? false
                : nodeDef.exposeToHomeAssistant,
    },
};

class EventsNode extends BaseNode {
    constructor(nodeDefinition, RED, nodeOptions = {}) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super(nodeDefinition, RED, nodeOptions);
        this.listeners = {};
        this.registered = false;
        this.integrationErrorMessage =
            'Node-RED custom integration needs to be installed in Home Assistant for this node to function correctly.';

        // Setup event listeners
        const events = {
            'ha_client:close': this.onHaEventsClose,
            'ha_client:open': this.onHaEventsOpen,
            'ha_client:error': this.onHaEventsError,
            'ha_client:connecting': this.onHaEventsConnecting,
            updateNodeStatus: this.onHaEventsUpdateStatus,
            [INTEGRATION_EVENT]: this.onHaIntegration,
            'ha_client:running': this.onHaEventsRunning,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.addEventClientListener(event, callback.bind(this))
        );
        this.updateConnectionStatus();
    }

    addEventClientListener(event, handler) {
        if (this.websocketClient) {
            this.listeners[event] = handler;
            this.websocketClient.addListener(event, handler);
        }
    }

    removeEventClientListeners() {
        if (this.websocketClient) {
            Object.entries(this.listeners).forEach(([event, handler]) => {
                this.websocketClient.removeListener(event, handler);
            });
        }
    }

    async onClose(removed) {
        this.removeEventClientListeners();
    }

    onHaEventsClose() {
        this.registered = false;
        this.updateConnectionStatus();
    }

    onHaEventsOpen() {
        this.updateConnectionStatus();
    }

    onHaEventsConnecting() {
        this.updateConnectionStatus();
    }

    onHaEventsUpdateStatus() {
        this.updateConnectionStatus();
    }

    onHaEventsRunning() {
        this.updateConnectionStatus();
    }

    onHaEventsError(err) {
        if (err.message) this.error(err.message);
    }

    onHaIntegration(type) {
        switch (type) {
            case INTEGRATION_LOADED:
                this.registerEntity();
                break;
            case INTEGRATION_UNLOADED:
            case INTEGRATION_NOT_LOADED:
                this.registered = false;
                break;
        }
    }

    registerEntity() {
        if (this.nodeConfig.exposeToHomeAssistant === false) {
            return false;
        }

        if (!this.isIntegrationLoaded) {
            if (this.type === 'ha-webhook' || this.type === 'ha-entity') {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
            }
            return false;
        }

        if (this.registered) {
            return false;
        }
    }
}

module.exports = EventsNode;
