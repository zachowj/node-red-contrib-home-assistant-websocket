const merge = require('lodash.merge');
const selectn = require('selectn');

const ComparatorService =
    require('../common/services/ComparatorService').default;
const State = require('../common/State').default;
const TransformState = require('../common/TransformState').default;
const {
    createControllerDependencies,
} = require('../common/controllers/helpers');
const { getHomeAssistant } = require('../homeAssistant');

const DEFAULT_NODE_OPTIONS = {
    config: {
        debugenabled: {},
        name: {},
        server: { isNode: true },
        version: (nodeDef) => nodeDef.version || 0,
    },
    input: {
        topic: { messageProp: 'topic' },
        payload: { messageProp: 'payload' },
    },
};

class BaseNode {
    constructor({ node, config, RED, status, nodeOptions = {} }) {
        this.node = node;
        this.RED = RED;
        this.options = merge({}, DEFAULT_NODE_OPTIONS, nodeOptions);
        this._eventHandlers = _eventHandlers;
        this._internals = _internals;
        this.status = status;
        this.state = new State(this.node);

        // TODO: move this to initializer and pass in as a parameter
        this.nodeConfig = Object.entries(this.options.config).reduce(
            (acc, [key, value]) => {
                if (value.isNode) {
                    acc[key] = this.RED.nodes.getNode(config[key]);
                } else if (typeof value === 'function') {
                    acc[key] = value.call(this, config);
                } else {
                    acc[key] = config[key];
                }

                return acc;
            },
            {}
        );

        node.on('input', this._eventHandlers.preOnInput.bind(this));
        node.on('close', this._eventHandlers.preOnClose.bind(this));

        // TODO: move to initializer after controllers are converted to typescript
        const { jsonataService, nodeRedContextService, typedInputService } =
            createControllerDependencies(this.node, this.homeAssistant);
        const transformState = new TransformState(
            this.server?.config?.ha_boolean
        );
        this.comparatorService = new ComparatorService({
            jsonataService,
            nodeRedContextService,
            homeAssistant: this.homeAssistant,
            transformState,
        });
        this.nodeRedContextService = nodeRedContextService;
        this.jsonataService = jsonataService;
        this.typedInputService = typedInputService;
        this.transformState = transformState;

        const name = selectn('nodeConfig.name', this);
        this.node.debug(`instantiated node, name: ${name || 'undefined'}`);
    }

    get server() {
        return this?.nodeConfig?.server;
    }

    get homeAssistant() {
        return getHomeAssistant(this.server);
    }

    get isConnected() {
        return this.homeAssistant && this.homeAssistant.isConnected;
    }

    get isHomeAssistantRunning() {
        return this.isConnected && this.homeAssistant.isHomeAssistantRunning;
    }

    get isIntegrationLoaded() {
        return this.isConnected && this.homeAssistant.isIntegrationLoaded;
    }

    get isEnabled() {
        return this.state.isEnabled();
    }

    set isEnabled(value) {
        this.state.setEnabled(value);
        this.status.setNodeState(value);
    }

    // Subclasses should override these as hooks into common events
    onClose(removed) {}

    onInput() {}

    send() {
        this.node.send(...arguments);
    }

    sendSplit(message, data, send) {
        if (!send) {
            send = this.send;
        }

        delete message._msgid;
        message.parts = {
            id: this.RED.util.generateId(),
            type: 'array',
            count: data.length,
            len: 1,
        };

        let pos = 0;
        for (let i = 0; i < data.length; i++) {
            message.payload = data.slice(pos, pos + 1)[0];
            message.parts.index = i;
            pos += 1;
            send(this.RED.util.cloneMessage(message));
        }
    }

    // Hack to get around the fact that node-red only sends warn / error to the debug tab
    debugToClient(debugMsg) {
        if (!this.nodeConfig.debugenabled) return;
        for (const msg of arguments) {
            const debugMsgObj = {
                id: this.node.id,
                path: `${this.node.z}/${this.node.id}`,
                name: this.node.name || '',
                msg,
            };
            this.RED.comms.publish('debug', debugMsgObj);
        }
    }

    getCastValue(datatype, value) {
        return this.transformState.transform(datatype, value);
    }

    castState(entity, type) {
        if (entity) {
            entity.original_state = entity.state;
            entity.state = this.getCastValue(type, entity.state);
        }
    }

    // TODO: Remove after controllers are converted to typescript
    setContextValue(val, location, property, message) {
        this.nodeRedContextService.set(val, location, property, message);
    }

    getComparatorResult(
        comparatorType,
        comparatorValue,
        actualValue,
        comparatorValueDatatype,
        { message, entity, prevEntity }
    ) {
        return this.comparatorService.getComparatorResult(
            comparatorType,
            comparatorValue,
            actualValue,
            comparatorValueDatatype,
            { message, entity, prevEntity }
        );
    }

    evaluateJSONata(expression, objs = {}) {
        return this.jsonataService.evaluate(expression, objs);
    }

    getTypedInputValue(value, valueType, props = {}) {
        return this.typedInputService.getValue(value, valueType, props);
    }

    setCustomOutputs(properties = [], message, extras) {
        properties.forEach((item) => {
            const value = this.getTypedInputValue(item.value, item.valueType, {
                message,
                ...extras,
            });

            try {
                this.nodeRedContextService.set(
                    value,
                    item.propertyType,
                    item.property,
                    message
                );
            } catch (e) {
                this.node.warn(
                    `Custom Ouput Error (${item.propertyType}:${item.property}): ${e.message}`
                );
            }
        });
    }
}

const _internals = {
    parseInputMessage(inputOptions, msg) {
        if (!inputOptions) return;
        const parsedResult = {};

        for (const [fieldKey, fieldConfig] of Object.entries(inputOptions)) {
            // Find messageProp value if it's a string or Array
            // When it's an array lowest valid index takes precedent
            const messageProp = Array.isArray(fieldConfig.messageProp)
                ? fieldConfig.messageProp.reduce(
                      (val, cur) => val || selectn(cur, msg),
                      undefined
                  )
                : selectn(fieldConfig.messageProp, msg);

            // Try to load from message
            const result = {
                key: fieldKey,
                value: messageProp,
                source: 'message',
                validation: null,
            };

            // If message missing value and node has config that can be used instead
            if (result.value === undefined && fieldConfig.configProp) {
                result.value = selectn(fieldConfig.configProp, this.nodeConfig);
                result.source = 'config';
            }

            if (
                result.value === undefined &&
                fieldConfig.default !== undefined
            ) {
                result.value =
                    typeof fieldConfig.default === 'function'
                        ? fieldConfig.default.call(this)
                        : fieldConfig.default;
                result.source = 'default';
            }

            // If value not found in both config and message
            if (result.value === undefined) {
                result.source = 'missing';
            }

            // If validation for value is configured run validation, optionally throwing on failed validation
            if (fieldConfig.validation) {
                const { error, value } = fieldConfig.validation.schema.validate(
                    result.value,
                    {
                        convert: true,
                    }
                );
                if (error && fieldConfig.validation.haltOnFail) throw error;
                result.validation = {
                    error,
                    value,
                };
            }

            // Assign result to config key value
            parsedResult[fieldKey] = result;
        }

        return parsedResult;
    },
};

const _eventHandlers = {
    preOnInput(message, send, done) {
        try {
            const parsedMessage = _internals.parseInputMessage.call(
                this,
                this.options.input,
                message
            );

            this.onInput({
                parsedMessage,
                message,
                send,
                done,
            });
        } catch (e) {
            if (e && e.isJoi) {
                this.status.setFailed('Error');
                done(e.message);
                return;
            }

            throw e;
        }
    },

    async preOnClose(removed, done) {
        this.node.debug(
            `closing node. Reason: ${
                removed ? 'node deleted' : 'node re-deployed'
            }`
        );
        try {
            await this.onClose(removed);
            done();
        } catch (e) {
            this.node.error(e.message);
        }
    },
};

module.exports = BaseNode;
