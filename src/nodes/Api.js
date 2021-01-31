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

    onInput({ message, parsedMessage }) {
        const node = this.node;
        const config = this.nodeConfig;

        if (!this.isConnected) {
            this.setStatusFailed('No Connection');
            node.error(
                'API call attempted without connection to server.',
                message
            );

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
                node.error(e.message, message);
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
                node.error('HTTP request requires a valid path.', message);
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
                    node.error(
                        `A WebSocket request requires a 'type' property in the data object.`,
                        message
                    );
                    this.setStatusFailed();
                    return null;
                }

                this.debugToClient(json);

                apiCall = this.homeAssistant.send.bind(
                    this.homeAssistant,
                    json
                );
            } catch (e) {
                node.error(e.message, message);
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

                this.send(message);
            })
            .catch((err) => {
                node.error(
                    'API Error. ' + err.message
                        ? `Error Message: ${err.message}`
                        : '',
                    message
                );
                this.setStatusFailed('API Error');
            });
    }
};
