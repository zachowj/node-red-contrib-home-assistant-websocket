const RenderTemplate = require('../../lib/mustache-context');
const BaseNode = require('../../lib/base-node');

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
        }
    };
    class ApiNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ message }) {
            const node = this;
            const config = node.nodeConfig;
            const serverName = node.utils.toCamelCase(config.server.name);
            const data = RenderTemplate(
                config.data,
                message,
                node.node.context(),
                serverName
            );
            let apiCall;

            if (config.protocol === 'http') {
                const path = RenderTemplate(
                    config.path,
                    message,
                    node.node.context(),
                    serverName
                ).replace(/^\/(?:api\/)?/, '');

                if (!path) {
                    node.error('HTTP request requires a valid path.');
                    return;
                }

                if (!['get', 'post'].includes(config.method)) {
                    node.error('HTTP request requires a valid method');
                    return;
                }

                apiCall = config.server.http[`_${config.method}`].bind(
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
                    node.setStatusSuccess(config.protocol);

                    const contextKey = RED.util.parseContextStore(
                        config.location
                    );
                    contextKey.key = contextKey.key || 'payload';
                    const locationType = config.location_type || 'msg';

                    if (locationType === 'flow' || locationType === 'global') {
                        node.node
                            .context()
                            [locationType].set(
                                contextKey.key,
                                results,
                                contextKey.store
                            );
                    } else if (locationType === 'msg') {
                        message[contextKey.key] = results;
                    }

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
