module.exports = function(RED) {
    const EventsNode = require('../../lib/events-node');

    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            outputs: 1,
            webhookId: {},
            exposeToHomeAssistant: nodeConfig => true
        }
    };

    class Webhook extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            if (this.isConnected) {
                this.registerEntity();
            }
        }

        onHaEventsClose() {
            super.onHaEventsClose();

            this.removeWebhook = null;
        }

        async onEvent(evt) {
            const message = {
                topic: this.nodeConfig.webhookId,
                payload: evt.data
            };

            this.setStatusSuccess('Received');
            this.send(message);
        }

        onHaIntegration(type) {
            if (type === 'loaded') {
                this.registerEntity();
            } else if (type === 'unloaded') {
                this.registered = false;
                if (this.removeWebhook) {
                    this.removeWebhook();
                    this.removeWebhook = null;
                }
            }
        }

        async registerEntity() {
            if (super.registerEntity() === false) {
                return;
            }

            if (!this.nodeConfig.webhookId) {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
                return;
            }

            if (!this.removeWebhook) {
                this.removeWebhook = await this.websocketClient.client.subscribeMessage(
                    this.onEvent.bind(this),
                    {
                        type: 'nodered/webhook',
                        webhook_id: this.nodeConfig.webhookId,
                        name: this.id,
                        server_id: this.nodeConfig.server.id
                    }
                );
            }
            this.setStatusSuccess('Registered');
            this.registered = true;
        }

        onClose(removed) {
            super.onClose(removed);

            if (this.isConnected && this.removeWebhook) {
                this.removeWebhook();
            }
        }
    }

    RED.nodes.registerType('ha-webhook', Webhook);
};
