const slugify = require('slugify');

const EventsHaNode = require('./EventsHaNode');
const {
    INTEGRATION_UNLOADED,
    STATUS_COLOR_YELLOW,
    STATUS_SHAPE_RING,
    STATUS_SHAPE_DOT,
    STATUS_COLOR_BLUE,
} = require('../const');

const OUTPUT_TYPE_INPUT = 'input';
const OUTPUT_TYPE_STATE_CHANGE = 'state change';

const nodeOptions = {
    config: {
        name: {},
        server: { isNode: true },
        outputs: 1,
        entityType: {},
        state: {},
        stateType: {},
        attributes: (nodeConfig) => nodeConfig.attributes || [],
        config: {},
        exposeToHomeAssistant: (nodeConfig) => true,
        resend: {},
        outputLocation: {},
        outputLocationType: (nodeConfig) =>
            nodeConfig.outputLocationType || 'none',
        inputOverride: (nodeConfig) => nodeConfig.inputOverride || 'allow',
        outputOnStateChange: {},
        outputPayload: {},
        outputPayloadType: {},
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

module.exports = class EntityNode extends EventsHaNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });
    }

    setConnectionStatus(additionalText) {
        if (this.nodeConfig.entityType === 'switch') {
            let status = this.getConnectionStatus();
            if (this.isConnected) {
                status = {
                    shape: this.isEnabled
                        ? STATUS_SHAPE_DOT
                        : STATUS_SHAPE_RING,
                    fill: STATUS_COLOR_YELLOW,
                    text: `${
                        this.isEnabled ? 'on' : 'off'
                    } at: ${this.getPrettyDate()}`,
                };
            }
            this.node.status(status);
        } else {
            super.setConnectionStatus(additionalText);
        }
    }

    setStatus(
        opts = {
            shape: STATUS_SHAPE_DOT,
            fill: STATUS_COLOR_YELLOW,
            text: '',
        }
    ) {
        this.node.status(opts);
    }

    async registerEntity() {
        if (this.nodeConfig.entityType === 'switch') {
            super.registerEntity();
            return;
        }

        if (!this.isIntegrationLoaded) {
            this.error(this.integrationErrorMessage);
            this.setStatusFailed('Error');
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
        this.setStatusSuccess('Registered');
        this.registered = true;
    }

    onHaEventMessage(evt) {
        super.onHaEventMessage(evt);
        if (
            evt.type === 'state_changed' &&
            this.nodeConfig.outputOnStateChange
        ) {
            // fake a HA entity
            const entity = {
                state: this.isEnabled,
            };
            let payload;
            try {
                payload = this.getTypedInputValue(
                    this.nodeConfig.outputPayload,
                    this.nodeConfig.outputPayloadType,
                    { entity }
                );
            } catch (e) {
                this.setStatusFailed('Error');
                this.node.error(`JSONata Error: ${e.message}`, {});
                return;
            }

            const msg = {
                payload,
                outputType: OUTPUT_TYPE_STATE_CHANGE,
            };
            const opts = [msg, null];
            const statusMessage = msg.payload || 'state change';
            const status = {
                text: `${statusMessage} at: ${this.getPrettyDate()}`,
                fill: STATUS_COLOR_BLUE,
                shape: STATUS_SHAPE_DOT,
            };
            if (this.isEnabled) {
                this.send(opts);
            } else {
                status.shape = STATUS_SHAPE_RING;
                this.send(opts.reverse());
            }
            this.setStatus(status);
        }
    }

    onHaEventsClose() {
        super.onHaEventsClose();

        if (this.nodeConfig.entityType !== 'switch') {
            this.registered = false;
        }
    }

    onHaIntegration(type) {
        super.onHaIntegration(type);

        if (type === INTEGRATION_UNLOADED) {
            this.node.error(
                'Node-RED custom integration has been removed from Home Assistant it is needed for this node to function.'
            );
            this.setStatusFailed('Error');
        }
    }

    onClose(removed) {
        super.onClose(removed);

        if (
            this.nodeConfig.entityType !== 'switch' &&
            this.registered &&
            this.isIntegrationLoaded &&
            removed
        ) {
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
        switch (this.nodeConfig.entityType) {
            case 'binary_sensor':
            case 'sensor':
                this.handleSensorInput({ parsedMessage, message, send, done });
                break;
            case 'switch':
                this.handleSwitchInput({ message, send, done });
                break;
            default:
                this.setStatusFailed('Error');
                done(`Invalid entity type: ${this.nodeConfig.entityType}`);
                break;
        }
    }

    handleSwitchInput({ message, send, done }) {
        if (typeof message.enable === 'boolean') {
            this.isEnabled = message.enable;
            this.updateHomeAssistant();
            this.updateConnectionStatus();
            done();
            return;
        }

        message.outputType = OUTPUT_TYPE_INPUT;
        const output = [message, null];
        const statusMessage = message.payload || OUTPUT_TYPE_INPUT;
        if (this.isEnabled) {
            this.setStatusSuccess(statusMessage);
            send(output);
        } else {
            this.setStatusFailed(statusMessage);
            send(output.reverse());
        }
    }

    handleSensorInput({ parsedMessage, message, send, done }) {
        if (!this.isConnected) {
            this.setStatusFailed('No Connection');
            done('Sensor update attempted without connection to server.');
            return;
        }

        if (!this.isIntegrationLoaded) {
            this.setStatusFailed('Error');
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
            this.setStatusFailed('Error');
            done(`State: ${e.message}`);
            return;
        }

        if (state === undefined) {
            this.setStatusFailed('Error');
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
            this.setStatusFailed('Error');
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
                this.setStatusSuccess(state);

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
                this.setStatusFailed('API Error');
                done(
                    `Entity API error. ${
                        err.message ? ` Error Message: ${err.message}` : ''
                    }`
                );
            });
    }

    handleTriggerMessage(data = {}) {
        const msg = {
            topic: 'triggered',
            payload: data.payload,
        };

        if (this.isEnabled) {
            this.setStatusSuccess('triggered');
            this.send([msg, null]);
        } else {
            this.setStatusFailed('triggered');
            this.send([null, msg]);
        }
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

    async loadPersistedData() {
        const data = await this.storage.getData().catch((e) => {
            this.node.error(e.message, {});
        });

        if (!data) return;

        if (
            this.nodeConfig.entityType === 'switch' &&
            Object.prototype.hasOwnProperty.call(data, 'isEnabled')
        ) {
            this.isEnabled = data.isEnabled;
            this.updateConnectionStatus();
        }
        if (Object.prototype.hasOwnProperty.call(data, 'lastPayload')) {
            this.lastPayload = data.lastPayload;
        }
    }
};
