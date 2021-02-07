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

    onInput({ message, parsedMessage, send, done }) {
        if (!this.homeAssistant) {
            this.setStatusFailed('No server');
            done('No valid Home Assistant server selected.');
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
                done(e.message);
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
                send(message);
                done();
            })
            .catch((err) => {
                this.setStatusFailed('API Error');
                done(
                    `Error firing event, home assistant rest api error: ${err.message}`
                );
            });
    }
};
