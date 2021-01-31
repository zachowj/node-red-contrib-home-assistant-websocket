const EventsNode = require('./EventsNode');

const { INTEGRATION_UNLOADED } = require('../const');

const nodeOptions = {
    config: {
        name: {},
        server: { isNode: true },
        outputs: 1,
        webhookId: {},
        exposeToHomeAssistant: (nodeConfig) => true,
        payloadLocation: (nodeConfig) =>
            nodeConfig.payloadLocation || 'payload',
        payloadLocationType: (nodeConfig) =>
            nodeConfig.payloadLocationType || 'msg',
        headersLocation: {},
        headersLocationType: (nodeConfig) =>
            nodeConfig.headersLocationType || 'none',
    },
};

module.exports = class Webhook extends EventsNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });

        if (this.isIntegrationLoaded) {
            this.registerEntity();
        }
    }

    onHaEventsClose() {
        super.onHaEventsClose();

        this.removeWebhook = null;
    }

    onEvent(evt) {
        const message = {
            topic: this.nodeConfig.webhookId,
        };

        // Set Payload Location
        this.setContextValue(
            evt.data.payload,
            this.nodeConfig.payloadLocationType,
            this.nodeConfig.payloadLocation,
            message
        );
        // Set Headers Location
        this.setContextValue(
            evt.data.headers,
            this.nodeConfig.headersLocationType,
            this.nodeConfig.headersLocation,
            message
        );
        this.setStatusSuccess('Received');
        this.send(message);
    }

    onHaIntegration(type) {
        super.onHaIntegration(type);

        if (type === INTEGRATION_UNLOADED) {
            if (this.removeWebhook) {
                this.removeWebhook();
                this.removeWebhook = null;
            }
            this.node.error(
                'Node-RED custom integration has been removed from Home Assistant it is needed for this node to function.'
            );
            this.setStatusFailed('Error');
        }
    }

    async registerEntity() {
        if (super.registerEntity() === false) {
            return;
        }

        if (!this.nodeConfig.webhookId) {
            this.node.error(this.integrationErrorMessage);
            this.setStatusFailed('Error');
            return;
        }

        if (!this.removeWebhook) {
            this.node.debug(`Adding webhook to HA`);
            this.removeWebhook = await this.homeAssistant.subscribeMessage(
                this.onEvent.bind(this),
                {
                    type: 'nodered/webhook',
                    webhook_id: this.nodeConfig.webhookId,
                    name: this.node.id,
                    server_id: this.nodeConfig.server.id,
                },
                { resubscribe: false }
            );
        }
        this.setStatusSuccess('Registered');
        this.registered = true;
    }

    onClose(removed) {
        super.onClose(removed);

        if (this.registered && this.isConnected && this.removeWebhook) {
            this.node.debug('Removing webhook from HA');
            this.removeWebhook().catch(() => {});
        }
    }
};
