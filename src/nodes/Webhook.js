const EventsNode = require('./EventsNode');

const { INTEGRATION_UNLOADED } = require('../const');

const nodeOptions = {
    config: {
        name: {},
        server: { isNode: true },
        outputs: 1,
        webhookId: {},
        exposeToHomeAssistant: () => true,
        outputProperties: {},
    },
};

class Webhook extends EventsNode {
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
        const message = {};
        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                data: evt.data.payload,
                headers: evt.data.headers,
                params: evt.data.params,
            });
        } catch (e) {
            this.node.error(e);
            this.status.setFailed('error');
            return;
        }

        this.status.setSuccess('Received');
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
            this.status.setFailed('Error');
        }
    }

    async registerEntity() {
        if (super.registerEntity() === false) {
            return;
        }

        if (!this.nodeConfig.webhookId) {
            this.node.error(this.integrationErrorMessage);
            this.status.setFailed('Error');
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
        this.status.setSuccess('Registered');
        this.registered = true;
    }

    onClose(removed) {
        super.onClose(removed);

        if (this.registered && this.isConnected && this.removeWebhook) {
            this.node.debug('Removing webhook from HA');
            this.removeWebhook().catch(() => {});
        }
    }
}

module.exports = Webhook;
