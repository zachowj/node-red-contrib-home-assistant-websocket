const Joi = require('@hapi/joi');
const BaseNode = require('../../lib/base-node');
const RenderTemplate = require('../../lib/mustache-context');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            event: {},
            data: {},
            mergecontext: {}
        },
        input: {
            event: {
                messageProp: 'payload.event',
                configProp: 'event',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().label('event')
                }
            },
            data: {
                messageProp: 'payload.data',
                configProp: 'data',
                validation: {
                    haltOnFail: false,
                    schema: Joi.string().label('data')
                }
            }
        }
    };

    class FireEventNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        // Disable connection status for api node
        setConnectionStatus() {}
        tryToObject(v) {
            if (!v) return null;
            try {
                return JSON.parse(v);
            } catch (e) {
                return v;
            }
        }

        onInput({ message, parsedMessage }) {
            const eventType = RenderTemplate(
                parsedMessage.event.value,
                message,
                this.node.context(),
                this.utils.toCamelCase(this.nodeConfig.server.name)
            );
            const configData = RenderTemplate(
                typeof parsedMessage.data.value === 'object'
                    ? JSON.stringify(parsedMessage.data.value)
                    : parsedMessage.data.value,
                message,
                this.node.context(),
                this.utils.toCamelCase(this.nodeConfig.server.name)
            );
            const eventData = this.getEventData(message.payload, configData);

            if (!eventType) {
                this.node.error(
                    'Fire event node is missing "event" property, not found in config or payload',
                    message
                );
                return;
            }

            this.debug(`Fire Event: ${eventType} -- ${JSON.stringify({})}`);

            message.payload = {
                event: eventType,
                data: eventData || null
            };

            this.setStatusSending();

            return this.nodeConfig.server.http
                .fireEvent(eventType, eventData)
                .then(() => {
                    this.setStatusSuccess(eventType);
                    this.send(message);
                })
                .catch(err => {
                    this.error(
                        `Error firing event, home assistant rest api error: ${
                            err.message
                        }`,
                        message
                    );
                    this.setStatusFailed('API Error');
                });
        }

        getEventData(payload, data) {
            let eventData;
            let contextData = {};

            let payloadData = this.utils.selectn('data', payload);
            let configData = this.tryToObject(data);
            payloadData = payloadData || {};
            configData = configData || {};

            // Calculate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
            if (this.nodeConfig.mergecontext) {
                const ctx = this.node.context();
                let flowVal = ctx.flow.get(this.nodeConfig.mergecontext);
                let globalVal = ctx.global.get(this.nodeConfig.mergecontext);
                flowVal = flowVal || {};
                globalVal = globalVal || {};
                contextData = this.utils.merge({}, globalVal, flowVal);
            }

            eventData = this.utils.merge(
                {},
                configData,
                contextData,
                payloadData
            );

            return eventData;
        }
    }

    RED.nodes.registerType('ha-fire-event', FireEventNode);
};
