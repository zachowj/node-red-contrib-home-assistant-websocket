const slugify = require('slugify');

module.exports = function(RED) {
    const EventsNode = require('../../lib/events-node');

    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            outputs: 1,
            entityType: {},
            state: {},
            stateType: {},
            attributes: {},
            config: {},
            exposeToHomeAssistant: nodeConfig => true,
            resend: {}
        },
        input: {
            state: {
                messageProp: 'payload.state',
                configProp: 'state',
                default: 'payload'
            },
            stateType: {
                messageProp: 'payload.stateType',
                configProp: 'stateType',
                default: 'msg'
            },
            attributes: {
                messageProp: 'payload.attributes',
                configProp: 'attributes',
                default: []
            }
        }
    };

    class EntityNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.registered = false;

            this.init();
        }

        async init() {
            await this.loadPersistedData();

            this.addEventClientListener(
                `ha_events:config_update`,
                this.onConfigUpdate.bind(this)
            );

            if (this.isConnected) {
                this.registerEntity();
            }
        }

        // Disable connection status
        setConnectionStatus() {}

        async registerEntity() {
            if (this.websocketClient.integrationVersion === 0) {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
                return;
            }

            if (this.registered) {
                return;
            }

            const config = {};
            this.nodeConfig.config
                .filter(c => {
                    return c.value.length;
                })
                .forEach(e => {
                    config[e.property] = e.value;
                });

            const payload = {
                type: 'nodered/discovery',
                server_id: this.nodeConfig.server.id,
                node_id: this.id,
                component: this.nodeConfig.entityType,
                config: config
            };

            // Add state and attributes to payload if resend enabled
            if (this.nodeConfig.resend && this.lastPayload) {
                payload.state = this.lastPayload.state;
                payload.attributes = this.lastPayload.attributes;
            }

            await this.websocketClient.send(payload);
            this.setStatusSuccess('Registered');
            this.registered = true;
        }

        onHaEventsClose() {
            super.onHaEventsClose();

            this.registered = false;
        }

        async onConfigUpdate() {
            this.registerEntity();
        }

        onClose(removed) {
            super.onClose(removed);

            if (this.isConnected && removed) {
                const payload = {
                    type: 'nodered/discovery',
                    server_id: this.nodeConfig.server.id,
                    node_id: this.id,
                    component: this.nodeConfig.entityType,
                    remove: true
                };

                this.websocketClient.send(payload);
            }
        }

        async onInput({ parsedMessage, message }) {
            if (this.websocketClient.integrationVersion === 0) {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
                return false;
            }

            const attr = {};
            // Set default for state from input to string
            if (
                parsedMessage.state.source === 'message' &&
                parsedMessage.stateType.source !== 'message'
            ) {
                parsedMessage.stateType.value = 'str';
            }

            let state;
            try {
                state = this.getValue(
                    parsedMessage.state.value,
                    parsedMessage.stateType.value,
                    message
                );
            } catch (e) {
                this.setStatusFailed('Error');
                this.node.error(e.message, message);
                return;
            }

            if (state === undefined) {
                this.error('State must be defined.');
                this.setStatusFailed('Error');
                return;
            }

            // Change string to lower-case and remove unwanted characters
            parsedMessage.attributes.value.forEach(x => {
                const property = slugify(x.property, {
                    replacement: '_',
                    remove: /[^A-Za-z0-9-_~ ]/,
                    lower: true
                });
                try {
                    attr[property] = this.getValue(
                        x.value,
                        x.valueType,
                        message
                    );
                } catch (e) {
                    this.setStatusFailed('Error');
                    this.node.error(e.message, message);
                }
            });

            const payload = {
                type: 'nodered/entity',
                server_id: this.nodeConfig.server.id,
                node_id: this.id,
                state: state,
                attributes: attr
            };
            this.saveNodeData('lastPayload', {
                state: payload.state,
                attributes: payload.attributes
            });

            this.websocketClient.send(payload);
            this.setStatusSuccess(state);
        }

        getValue(value, valueType, msg) {
            let val;
            switch (valueType) {
                case 'msg':
                case 'flow':
                case 'global':
                    val = this.getContextValue(valueType, value, msg);
                    break;
                case 'bool':
                    val = value === 'true';
                    break;
                case 'json':
                    try {
                        val = JSON.parse(value);
                    } catch (e) {
                        // error parsing
                    }
                    break;
                case 'date':
                    val = Date.now();
                    break;
                case 'jsonata':
                    try {
                        val = this.evaluateJSONata(value, msg);
                    } catch (e) {
                        throw new Error(`JSONata Error: ${e.message}`);
                    }
                    break;
                case 'num':
                    val = Number(value);
                    break;
                default:
                    val = value;
            }
            return val;
        }

        async loadPersistedData() {
            try {
                const data = await this.getNodeData();
                if (
                    data &&
                    Object.prototype.hasOwnProperty.call(data, 'lastPayload')
                ) {
                    this.lastPayload = data.lastPayload;
                }
            } catch (e) {
                this.error(e.message);
            }
        }
    }

    RED.nodes.registerType('ha-entity', EntityNode);
};
