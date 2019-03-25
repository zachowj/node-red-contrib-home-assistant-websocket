const RenderTemplate = require('../../lib/mustache-context');
const BaseNode = require('../../lib/base-node');
const Joi = require('joi');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            protocol: {},
            method: {},
            path: {},
            data: {},
            location: {},
            locationType: {}
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
                        .label('protocol')
                }
            },
            method: {
                messageProp: 'payload.method',
                configProp: 'method',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid('get', 'post')
                        .label('method')
                }
            },
            path: {
                messageProp: 'payload.path',
                configProp: 'path',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .allow('')
                        .label('path')
                }
            },
            data: {
                messageProp: 'payload.data',
                configProp: 'data'
            },
            location: {
                messageProp: 'payload.location',
                configProp: 'location',
                default: 'payload',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().label('location')
                }
            },
            locationType: {
                messageProp: 'payload.locationType',
                configProp: 'locationType',
                default: 'msg',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid('msg', 'flow', 'global', 'none')
                        .label('locationType')
                }
            }
        }
    };
    class ApiNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ message, parsedMessage }) {
            const node = this;
            const config = node.nodeConfig;

            if (
                config.server.websocket.connectionState !==
                config.server.websocket.CONNECTED
            ) {
                this.setStatusFailed('No Connection');
                this.warn('API call attempted without connection to server.');

                return;
            }

            const serverName = node.utils.toCamelCase(config.server.name);
            const data = RenderTemplate(
                typeof parsedMessage.data.value === 'object'
                    ? JSON.stringify(parsedMessage.data.value)
                    : parsedMessage.data.value,
                message,
                node.node.context(),
                serverName
            );
            const method = parsedMessage.method.value;
            let apiCall;

            if (parsedMessage.protocol.value === 'http') {
                const path = RenderTemplate(
                    parsedMessage.path.value,
                    message,
                    node.node.context(),
                    serverName
                ).replace(/^\/(?:api\/)?/, '');

                if (!path) {
                    node.error('HTTP request requires a valid path.');
                    node.setStatusFailed();
                    return;
                }

                apiCall = config.server.http[`_${method}`].bind(
                    config.server.http,
                    path,
                    data
                );
            } else {
                try {
                    const json = JSON.parse(data);

                    if (!json.type) {
                        node.error(
                            `A WebSocket request requires a 'type' property in the data object.`
                        );
                        node.setStatusFailed();
                        return null;
                    }

                    apiCall = config.server.websocket.send.bind(
                        config.server.websocket,
                        json
                    );
                } catch (e) {
                    node.error(e.message);
                    node.setStatusFailed();
                    return;
                }
            }

            node.setStatusSending();

            return apiCall()
                .then(results => {
                    node.setStatusSuccess(
                        `${parsedMessage.protocol.value} called`
                    );

                    this.setContextValue(
                        results,
                        parsedMessage.locationType.value,
                        parsedMessage.location.value,
                        message
                    );

                    node.send(message);
                })
                .catch(err => {
                    node.error(
                        'API Error. ' + err.message
                            ? `Error Message: ${err.message}`
                            : ''
                    );
                    node.setStatusFailed('API Error');
                });
        }
    }

    RED.nodes.registerType('ha-api', ApiNode);
};
