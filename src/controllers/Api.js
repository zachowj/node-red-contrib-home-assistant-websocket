const Joi = require('joi');

const BaseNode = require('./BaseNode');
const { renderTemplate } = require('../helpers/renderTemplate');

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

        let data;
        if (parsedMessage.dataType.value === 'jsonata') {
            try {
                data = JSON.stringify(
                    this.evaluateJSONata(parsedMessage.data.value, { message })
                );
            } catch (e) {
                this.status.setFailed('Error');
                done(e.message);
                return;
            }
        } else {
            data = renderTemplate(
                typeof parsedMessage.data.value === 'object'
                    ? JSON.stringify(parsedMessage.data.value)
                    : parsedMessage.data.value,
                message,
                this.node.context(),
                this.homeAssistant.getStates()
            );
        }

        const method = parsedMessage.method.value;
        let apiCall;

        if (parsedMessage.protocol.value === 'http') {
            const path = renderTemplate(
                parsedMessage.path.value,
                message,
                this.node.context(),
                this.homeAssistant.getStates()
            ).replace(/^\/(?:api\/)?/, '');

            if (!path) {
                done('HTTP request requires a valid path.');
                this.status.setFailed();
                return;
            }

            this.debugToClient({ method, path, data });

            apiCall = this.homeAssistant[method].bind(
                this.homeAssistant,
                path,
                data,
                parsedMessage.responseType.value
            );
        } else {
            try {
                const json = JSON.parse(data);

                if (!json.type) {
                    done(
                        `A WebSocket request requires a 'type' property in the data object.`
                    );
                    this.status.setFailed();
                    return;
                }

                this.debugToClient(json);

                apiCall = this.homeAssistant.send.bind(
                    this.homeAssistant,
                    json
                );
            } catch (e) {
                done(e.message);
                this.status.setFailed();
                return;
            }
        }

        this.status.setSending();

        const results = await apiCall().catch((err) => {
            done(
                'API Error. ' + err.message
                    ? `Error Message: ${err.message}`
                    : ''
            );
            this.status.setFailed('API Error');
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
