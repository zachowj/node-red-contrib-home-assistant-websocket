const Joi = require('joi');

const BaseNode = require('../BaseNode');
const { renderTemplate } = require('../../helpers/renderTemplate');

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

class FireEvent extends BaseNode {
    constructor({ node, RED, status, config }) {
        super({ node, config, RED, status, nodeOptions });
    }

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
            this.status.setFailed('No server');
            done('No valid Home Assistant server selected.');
            return;
        }

        const eventType = renderTemplate(
            parsedMessage.event.value,
            message,
            this.node.context(),
            this.homeAssistant.getStates()
        );
        let eventData;
        if (parsedMessage.dataType.value === 'jsonata') {
            try {
                eventData = JSON.stringify(
                    this.evaluateJSONata(parsedMessage.data.value, { message })
                );
            } catch (e) {
                this.status.setFailed('Error');
                done(e.message);
                return;
            }
        } else {
            eventData = renderTemplate(
                typeof parsedMessage.data.value === 'object'
                    ? JSON.stringify(parsedMessage.data.value)
                    : parsedMessage.data.value,
                message,
                this.node.context(),
                this.homeAssistant.getStates()
            );
        }

        this.node.debug(`Fire Event: ${eventType} -- ${JSON.stringify({})}`);

        message.payload = {
            event: eventType,
            data: eventData || null,
        };

        this.status.setSending();

        return this.homeAssistant
            .fireEvent(eventType, eventData)
            .then(() => {
                this.status.setSuccess(eventType);
                send(message);
                done();
            })
            .catch((err) => {
                this.status.setFailed('API Error');
                done(
                    `Error firing event, home assistant rest api error: ${err.message}`
                );
            });
    }
}

module.exports = FireEvent;
