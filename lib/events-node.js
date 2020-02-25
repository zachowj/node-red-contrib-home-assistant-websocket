const merge = require('lodash.merge');
const BaseNode = require('./base-node');

const DEFAULT_NODE_OPTIONS = {
    debug: false,
    config: {
        name: {},
        server: { isNode: true },
        exposeToHomeAssistant: nodeDef =>
            nodeDef.exposeToHomeAssistant === undefined
                ? false
                : nodeDef.exposeToHomeAssistant
    }
};

class EventsNode extends BaseNode {
    constructor(nodeDefinition, RED, nodeOptions = {}) {
        nodeOptions = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        super(nodeDefinition, RED, nodeOptions);
        this.listeners = {};
        this.registered = false;
        this.integrationErrorMessage =
            'Node-RED custom integration needs to be installed in Home Assistant for this node to function correctly.';

        this.addEventClientListener(
            'ha_client:close',
            this.onHaEventsClose.bind(this)
        );
        this.addEventClientListener(
            'ha_client:open',
            this.onHaEventsOpen.bind(this)
        );
        this.addEventClientListener(
            'ha_client:error',
            this.onHaEventsError.bind(this)
        );
        this.addEventClientListener(
            'ha_client:connecting',
            this.onHaEventsConnecting.bind(this)
        );
        this.addEventClientListener(
            'updateNodeStatus',
            this.onHaEventsUpdateStatus.bind(this)
        );
        this.addEventClientListener(
            `ha_events:config_update`,
            this.onHaConfigUpdate.bind(this)
        );
        this.addEventClientListener(
            `integration`,
            this.onHaIntegration.bind(this)
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

    onHaEventsError(err) {
        if (err.message) this.error(err.message);
    }

    onHaConfigUpdate() {
        this.registerEntity();
    }

    onHaIntegration(type) {
        if (type === 'loaded') {
            this.registerEntity();
        } else if (type === 'unloaded') {
            this.registered = false;
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

    shouldIncludeEvent(eventId) {
        const entityId =
            this.nodeConfig.entityidfilter || this.nodeConfig.entityId;
        const type =
            this.nodeConfig.entityidfiltertype ||
            this.nodeConfig.entityIdFilterType;

        if (!entityId) return true;

        if (type === 'substring') {
            const found = entityId.filter(
                filterStr => eventId.indexOf(filterStr) >= 0
            );
            return found.length > 0;
        }

        if (type === 'regex') {
            return entityId.test(eventId);
        }

        return entityId === eventId;
    }
}

module.exports = EventsNode;
