const Joi = require('joi');

const BaseNode = require('../BaseNode');
const { generateRenderTemplate } = require('../../helpers/mustache');

const nodeOptions = {
    config: {
        name: {},
        server: { isNode: true },
        protocol: {},
        method: {},
        path: {},
        data: {},
        dataType: (nodeDef) => nodeDef.dataType || 'json',
        responseType: {},
        outputProperties: {},
    },
    input: {
        protocol: {
            messageProp: 'payload.protocol',
            configProp: 'protocol',
            default: 'websocket',
            validation: {
                haltOnFail: true,
                schema: Joi.string()
                    .valid('websocket', 'http')
                    .label('protocol'),
            },
        },
        method: {
            messageProp: 'payload.method',
            configProp: 'method',
            validation: {
                haltOnFail: true,
                schema: Joi.string().valid('get', 'post').label('method'),
            },
        },
        path: {
            messageProp: 'payload.path',
            configProp: 'path',
            validation: {
                haltOnFail: true,
                schema: Joi.string().allow('').label('path'),
            },
        },
        data: {
            messageProp: 'payload.data',
            configProp: 'data',
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
        location: {
            messageProp: 'payload.location',
            configProp: 'location',
            default: 'payload',
            validation: {
                haltOnFail: true,
                schema: Joi.string().label('location'),
            },
        },
        locationType: {
            messageProp: 'payload.locationType',
            configProp: 'locationType',
            default: 'msg',
            validation: {
                haltOnFail: true,
                schema: Joi.string()
                    .valid('msg', 'flow', 'global', 'none')
                    .label('locationType'),
            },
        },
        responseType: {
            messageProp: 'payload.responseType',
            configProp: 'responseType',
            default: 'json',
            validation: {
                schema: Joi.string()
                    .valid('json', 'text', 'arraybuffer')
                    .label('responseType'),
            },
        },
        outputProperties: {
            messageProp: 'payload.outputProperties',
            configProp: 'outputProperties',
        },
    },
};

class Api extends BaseNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });
    }

    async onInput({ message, parsedMessage, send, done }) {
        if (!this.isConnected) {
            this.status.setFailed('No Connection');
            done('API call attempted without connection to server.');

            return;
        }

        const renderTemplate = generateRenderTemplate(
            message,
            this.node.context(),
            this.homeAssistant.getStates()
        );
        let data;

        if (parsedMessage.data.source === 'message') {
            data = parsedMessage.data.value;
        } else if (
            parsedMessage.data.value &&
            parsedMessage.data.value.length > 0
        ) {
            try {
                if (parsedMessage.dataType.value === 'jsonata') {
                    data = this.evaluateJSONata(parsedMessage.data.value, {
                        message,
                    });
                } else {
                    data = JSON.parse(
                        renderTemplate(
                            typeof parsedMessage.data.value === 'object'
                                ? JSON.stringify(parsedMessage.data.value)
                                : parsedMessage.data.value
                        )
                    );
                }
            } catch (e) {
                this.status.setFailed('Error');
                done(e.message);
                return;
            }
        }

        let apiCall;

        if (parsedMessage.protocol.value === 'http') {
            const path = renderTemplate(parsedMessage.path.value).replace(
                /^\/(?:api\/)?/,
                ''
            );

            if (!path) {
                done('HTTP request requires a valid path.');
                this.status.setFailed();
                return;
            }

            const method = parsedMessage.method.value;
            this.debugToClient({ method, path, data });

            apiCall = this.homeAssistant[method].bind(
                this.homeAssistant,
                path,
                data,
                parsedMessage.responseType.value
            );
        } else {
            if (!data || !data.type) {
                done(
                    `A WebSocket request requires a 'type' property in the data object.`
                );
                this.status.setFailed();
                return;
            }

            this.debugToClient(JSON.stringify(data));

            apiCall = this.homeAssistant.send.bind(this.homeAssistant, data);
        }

        this.status.setSending();

        const results = await apiCall().catch((err) => {
            this.status.setFailed('API Error');
            done(
                `API Error. ${
                    err.message ? `Error Message: ${err.message}` : ''
                }`
            );
        });

        try {
            this.setCustomOutputs(
                parsedMessage.outputProperties.value,
                message,
                {
                    results,
                    config: this.nodeConfig,
                }
            );
        } catch (e) {
            this.status.setFailed('error');
            done(e.message);
            return;
        }

        this.status.setSuccess(`${parsedMessage.protocol.value} called`);

        send(message);
        done();
    }
}

module.exports = Api;
