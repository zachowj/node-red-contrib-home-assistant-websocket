const merge = require('lodash.merge');

const BaseNode = require('./base-node');

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
            integration: this.onHaIntegration,
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
            case 'loaded':
            case 'notloaded':
                this.registerEntity();
                break;
            case 'unloaded':
                this.registered = false;
                break;
        }
    }

    registerEntity() {
        if (this.nodeConfig.exposeToHomeAssistant === false) {
            return false;
        }

        if (this.websocketClient.integrationVersion === 0) {
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
