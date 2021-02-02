const Joi = require('joi');

const BaseNode = require('./BaseNode');
const RenderTemplate = require('../lib/mustache-context');

const nodeOptions = {
    config: {
        name: {},
        server: { isNode: true },
        event: {},
        data: {},
        dataType: (nodeDef) => nodeDef.dataType || 'json',
    },
    input: {
        event: {
            messageProp: 'payload.event',
            configProp: 'event',
            validation: {
                haltOnFail: true,
                schema: Joi.string().label('event'),
            },
        },
        data: {
            messageProp: 'payload.data',
            configProp: 'data',
            validation: {
                haltOnFail: false,
                schema: Joi.string().label('data'),
            },
        },
        dataType: {
            messageProp: 'payload.dataType',
            configProp: 'dataType',
            default: 'json',
            validation: {
                haltOnFail: true,
                schema: Joi.string().valid('json', 'jsonata').label('dataType'),
            },
        },
    },
};

module.exports = class FireEvent extends BaseNode {
    constructor({ node, RED, config }) {
        super({ node, config, RED, nodeOptions });
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
        if (!this.homeAssistant) {
            this.setStatusFailed('No server');
            this.node.error(
                'No valid Home Assistant server selected.',
                message
            );
            return;
        }

        const eventType = RenderTemplate(
            parsedMessage.event.value,
            message,
            this.node.context(),
            this.nodeConfig.server.name
        );
        let eventData;
        if (parsedMessage.dataType.value === 'jsonata') {
            try {
                eventData = JSON.stringify(
                    this.evaluateJSONata(parsedMessage.data.value, message)
                );
            } catch (e) {
                this.setStatusFailed('Error');
                this.node.error(e.message, message);
                return;
            }
        } else {
            eventData = RenderTemplate(
                typeof parsedMessage.data.value === 'object'
                    ? JSON.stringify(parsedMessage.data.value)
                    : parsedMessage.data.value,
                message,
                this.node.context(),
                this.nodeConfig.server.name
            );
        }

        this.node.debug(`Fire Event: ${eventType} -- ${JSON.stringify({})}`);

        message.payload = {
            event: eventType,
            data: eventData || null,
        };

        this.setStatusSending();

        return this.homeAssistant
            .fireEvent(eventType, eventData)
            .then(() => {
                this.setStatusSuccess(eventType);
                this.send(message);
            })
            .catch((err) => {
                this.node.error(
                    `Error firing event, home assistant rest api error: ${err.message}`,
                    message
                );
                this.setStatusFailed('API Error');
            });
    }
};
