const slugify = require('slugify');

const EntityNode = require('../EntityNode');

const nodeOptions = {
    config: {
        state: {},
        stateType: {},
        attributes: (nodeConfig) => nodeConfig.attributes || [],
        resend: {},
        outputLocation: {},
        outputLocationType: {},
        inputOverride: {},
    },
    input: {
        state: {
            messageProp: 'payload.state',
            configProp: 'state',
            default: 'payload',
        },
        stateType: {
            messageProp: 'payload.stateType',
            configProp: 'stateType',
            default: 'msg',
        },
        attributes: {
            messageProp: 'payload.attributes',
            configProp: 'attributes',
            default: [],
        },
    },
};

class Sensor extends EntityNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });
    }

    async registerEntity() {
        if (!this.isIntegrationLoaded) {
            this.error(this.integrationErrorMessage);
            this.status.setFailed('Error');
            return;
        }

        if (this.registered) {
            return;
        }

        const config = {};
        this.nodeConfig.config
            .filter((c) => c.value.length)
            .forEach((e) => (config[e.property] = e.value));

        const payload = {
            type: 'nodered/discovery',
            server_id: this.nodeConfig.server.id,
            node_id: this.node.id,
            component: this.nodeConfig.entityType,
            config: config,
        };

        // Add state and attributes to payload if resend enabled
        if (this.nodeConfig.resend && this.lastPayload) {
            payload.state = this.lastPayload.state;
            payload.attributes = this.lastPayload.attributes;
        }

        this.debugToClient(payload);

        this.node.debug(`Registering ${this.nodeConfig.entityType} with HA`);
        await this.homeAssistant.send(payload);
        this.status.setSuccess('Registered');
        this.registered = true;
    }

    onClose(removed) {
        super.onClose(removed);

        if (this.registered && this.isIntegrationLoaded && removed) {
            const payload = {
                type: 'nodered/discovery',
                server_id: this.nodeConfig.server.id,
                node_id: this.node.id,
                component: this.nodeConfig.entityType,
                remove: true,
            };
            this.node.debug(
                `Unregistering ${this.nodeConfig.entityType} from HA`
            );
            this.homeAssistant.send(payload);
        }
    }

    onInput({ parsedMessage, message, send, done }) {
        if (!this.isConnected) {
            this.status.setFailed('No Connection');
            done('Sensor update attempted without connection to server.');
            return;
        }

        if (!this.isIntegrationLoaded) {
            this.status.setFailed('Error');
            done(this.integrationErrorMessage);
            return;
        }

        let state = parsedMessage.state.value;
        let stateType = parsedMessage.stateType.value;
        if (this.nodeConfig.inputOverride === 'block') {
            state = this.nodeConfig.state;
            stateType = this.nodeConfig.stateType;
        } else if (
            parsedMessage.state.source === 'message' &&
            stateType !== 'message'
        ) {
            // Set default for state from input to string
            stateType = 'str';
        }

        try {
            state = this.getTypedInputValue(state, stateType, { message });
        } catch (e) {
            this.status.setFailed('Error');
            done(`State: ${e.message}`);
            return;
        }

        if (state === undefined) {
            this.status.setFailed('Error');
            done('State must be defined.');
            return;
        }

        const attributes = this.getAttributes(parsedMessage);

        const attr = {};
        try {
            attributes.forEach((x) => {
                // Change string to lower-case and remove unwanted characters
                const property = slugify(x.property, {
                    replacement: '_',
                    remove: /[^A-Za-z0-9-_~ ]/,
                    lower: true,
                });
                attr[property] = this.getTypedInputValue(x.value, x.valueType, {
                    message,
                });
            });
        } catch (e) {
            this.status.setFailed('Error');
            done(`Attribute: ${e.message}`);
            return;
        }

        const payload = {
            type: 'nodered/entity',
            server_id: this.nodeConfig.server.id,
            node_id: this.node.id,
            state: state,
            attributes: attr,
        };
        this.lastPayload = {
            state: state,
            attributes: attr,
        };
        this.storage.saveData('lastPayload', this.lastPayload);
        this.debugToClient(payload);

        this.homeAssistant
            .send(payload)
            .then(() => {
                this.status.setSuccess(state);

                if (this.nodeConfig.outputLocationType !== 'none') {
                    this.setContextValue(
                        payload,
                        this.nodeConfig.outputLocationType || 'msg',
                        this.nodeConfig.outputLocation || 'payload',
                        message
                    );
                }

                send(message);
                done();
            })
            .catch((err) => {
                this.status.setFailed('API Error');
                done(
                    `Entity API error. ${
                        err.message ? ` Error Message: ${err.message}` : ''
                    }`
                );
            });
    }

    getAttributes(parsedMessage) {
        let attributes = [];
        if (
            parsedMessage.attributes.source !== 'message' ||
            this.nodeConfig.inputOverride === 'block'
        ) {
            attributes = this.nodeConfig.attributes;
        } else {
            if (this.nodeConfig.inputOverride === 'merge') {
                const keys = Object.keys(
                    parsedMessage.attributes.value
                ).map((e) => e.toLowerCase());
                this.nodeConfig.attributes.forEach((ele) => {
                    if (!keys.includes(ele.property.toLowerCase())) {
                        attributes.push(ele);
                    }
                });
            }
            for (const [prop, val] of Object.entries(
                parsedMessage.attributes.value
            )) {
                attributes.push({
                    property: prop,
                    value: val,
                });
            }
        }
        return attributes;
    }
}

module.exports = Sensor;
