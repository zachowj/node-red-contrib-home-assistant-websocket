const Joi = require('joi');

const BaseNode = require('./BaseNode');
const RenderTemplate = require('../lib/mustache-context');

const nodeOptions = {
    config: {
        name: {},
        server: { isNode: true },
        protocol: {},
        method: {},
        path: {},
        data: {},
        dataType: (nodeDef) => nodeDef.dataType || 'json',
        location: {},
        locationType: {},
        responseType: {},
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
    },
};

module.exports = class ApiNode extends BaseNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });
    }

    onInput({ message, parsedMessage, send, done }) {
        const node = this.node;
        const config = this.nodeConfig;

        if (!this.isConnected) {
            this.setStatusFailed('No Connection');
            done('API call attempted without connection to server.');

            return;
        }

        let data;
        if (parsedMessage.dataType.value === 'jsonata') {
            try {
                data = JSON.stringify(
                    this.evaluateJSONata(parsedMessage.data.value, message)
                );
            } catch (e) {
                this.setStatusFailed('Error');
                done(e.message);
                return;
            }
        } else {
            data = RenderTemplate(
                typeof parsedMessage.data.value === 'object'
                    ? JSON.stringify(parsedMessage.data.value)
                    : parsedMessage.data.value,
                message,
                node.context(),
                config.server.name
            );
        }

        const method = parsedMessage.method.value;
        let apiCall;

        if (parsedMessage.protocol.value === 'http') {
            const path = RenderTemplate(
                parsedMessage.path.value,
                message,
                node.context(),
                config.server.name
            ).replace(/^\/(?:api\/)?/, '');

            if (!path) {
                done('HTTP request requires a valid path.');
                this.setStatusFailed();
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
                    this.setStatusFailed();
                    return;
                }

                this.debugToClient(json);

                apiCall = this.homeAssistant.send.bind(
                    this.homeAssistant,
                    json
                );
            } catch (e) {
                done(e.message);
                this.setStatusFailed();
                return;
            }
        }

        this.setStatusSending();

        return apiCall()
            .then((results) => {
                this.setStatusSuccess(`${parsedMessage.protocol.value} called`);

                this.setContextValue(
                    results,
                    parsedMessage.locationType.value,
                    parsedMessage.location.value,
                    message
                );

                send(message);
                done();
            })
            .catch((err) => {
                done(
                    'API Error. ' + err.message
                        ? `Error Message: ${err.message}`
                        : ''
                );
                this.setStatusFailed('API Error');
            });
    }
};
