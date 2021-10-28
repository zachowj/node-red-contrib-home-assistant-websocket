const merge = require('lodash.merge');
const random = require('lodash.random');
const sampleSize = require('lodash.samplesize');
const selectn = require('selectn');

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
        this._enabled = true;
        this.status = status;

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

        const name = selectn('nodeConfig.name', this);
        this.node.debug(`instantiated node, name: ${name || 'undefined'}`);
    }

    get server() {
        return selectn('nodeConfig.server.controller', this);
    }

    get homeAssistant() {
        return selectn('server.homeAssistant', this);
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
        return this._enabled;
    }

    set isEnabled(value) {
        this._enabled = !!value;
        this.status.setNodeState(this._enabled);
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
                name: this.node.name || '',
                msg,
            };
            this.RED.comms.publish('debug', debugMsgObj);
        }
    }

    getCastValue(datatype, value) {
        if (!datatype) return value;

        switch (datatype) {
            case 'num':
                return parseFloat(value);
            case 'str':
                return value + '';
            case 'bool':
                return !!value;
            case 'habool': {
                const booleanConfig = selectn(
                    'nodeConfig.server.config.ha_boolean',
                    this
                );
                const regex =
                    booleanConfig === undefined
                        ? `^(y|yes|true|on|home|open)$`
                        : `^(${booleanConfig})$`;
                return new RegExp(regex, 'i').test(value);
            }
            case 're':
                return new RegExp(value);
            case 'list':
                return value ? value.split(',').map((e) => e.trim()) : [];
            default:
                return value;
        }
    }

    castState(entity, type) {
        if (entity) {
            entity.original_state = entity.state;
            entity.state = this.getCastValue(type, entity.state);
        }
    }

    getContextValue(location, property, message) {
        if (message && location === 'msg') {
            return this.RED.util.getMessageProperty(message, property);
        }

        const contextKey = this.RED.util.parseContextStore(property);
        return this.node
            .context()
            [location].get(contextKey.key, contextKey.store);
    }

    setContextValue(val, location, property, message) {
        const contextKey = this.RED.util.parseContextStore(property);

        switch (location) {
            case 'none':
                break;
            case 'flow':
            case 'global':
                this.node
                    .context()
                    [location].set(contextKey.key, val, contextKey.store);
                break;
            case 'msg':
            default:
                this.RED.util.setObjectProperty(message, contextKey.key, val);
                break;
        }
    }

    getComparatorResult(
        comparatorType,
        comparatorValue,
        actualValue,
        comparatorValueDatatype,
        { message, entity, prevEntity }
    ) {
        if (comparatorValueDatatype === 'bool') {
            comparatorValue = comparatorValue === 'true';
        }

        let cValue;
        if (['msg', 'flow', 'global'].includes(comparatorValueDatatype)) {
            cValue = this.getContextValue(
                comparatorValueDatatype,
                comparatorValue,
                message
            );
        } else if (['entity', 'prevEntity'].includes(comparatorValueDatatype)) {
            cValue = selectn(
                comparatorValue,
                comparatorValueDatatype === 'entity' ? entity : prevEntity
            );
        } else if (
            comparatorType !== 'jsonata' &&
            comparatorValueDatatype === 'jsonata' &&
            comparatorValue
        ) {
            try {
                cValue = this.evaluateJSONata(comparatorValue, {
                    message,
                    entity,
                    prevEntity,
                });
            } catch (e) {
                throw new Error(`JSONata Error: ${e.message}`);
            }
        } else {
            if (
                comparatorType === 'includes' ||
                comparatorType === 'does_not_include'
            ) {
                comparatorValueDatatype = 'list';
            }

            cValue = this.getCastValue(
                comparatorValueDatatype,
                comparatorValue
            );
        }

        switch (comparatorType) {
            case 'is':
            case 'is_not': {
                // Datatype might be num, bool, str, re (regular expression)
                const isMatch =
                    comparatorValueDatatype === 're'
                        ? cValue.test(actualValue)
                        : cValue === actualValue;
                return comparatorType === 'is' ? isMatch : !isMatch;
            }
            case 'includes':
            case 'does_not_include': {
                const isIncluded = cValue.includes(actualValue);
                return comparatorType === 'includes' ? isIncluded : !isIncluded;
            }
            case 'cont':
                return (actualValue + '').indexOf(cValue) !== -1;
            case 'greater_than': // here for backwards compatibility
            case '>':
            case 'gt':
                return actualValue > cValue;
            case '>=':
            case 'gte':
                return actualValue >= cValue;
            case 'less_than': // here for backwards compatibility
            case '<':
            case 'lt':
                return actualValue < cValue;
            case '<=':
            case 'lte':
                return actualValue <= cValue;
            case 'starts_with':
                return actualValue && actualValue.startsWith(cValue);
            case 'in_group': {
                const ent = this.homeAssistant.getStates(cValue);
                const groupEntities =
                    selectn('attributes.entity_id', ent) || [];
                return groupEntities.includes(actualValue);
            }
            case 'jsonata':
                if (!cValue) return true;

                try {
                    return (
                        this.evaluateJSONata(cValue, {
                            message,
                            entity,
                            prevEntity,
                        }) === true
                    );
                } catch (e) {
                    throw new Error(`JSONata Error: ${e.message}`);
                }
        }
    }

    evaluateJSONata(expression, objs = {}) {
        const expr = this.RED.util.prepareJSONataExpression(
            expression,
            this.node
        );
        const { entity, message, prevEntity } = objs;

        expr.assign('entity', () => entity);
        expr.assign(
            'entities',
            (val) => this.homeAssistant && this.homeAssistant.getStates(val)
        );
        expr.assign('outputData', (obj) => {
            if (!obj) {
                const filtered = Object.keys(objs).reduce((acc, key) => {
                    // ignore message as it already accessable
                    if (key !== 'message' && objs[key] !== undefined) {
                        acc[key] = objs[key];
                    }
                    return acc;
                }, {});
                return filtered;
            }

            return objs[obj];
        });
        expr.assign('prevEntity', () => prevEntity);
        expr.assign('randomNumber', random);
        expr.assign('sampleSize', sampleSize);

        return this.RED.util.evaluateJSONataExpression(expr, message);
    }

    getTypedInputValue(value, valueType, props = {}) {
        let val;
        switch (valueType) {
            case 'msg':
            case 'flow':
            case 'global':
                val = this.getContextValue(valueType, value, props.message);
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
                // no reason to error just return undefined
                if (value === '') {
                    val = undefined;
                    break;
                }
                try {
                    val = this.evaluateJSONata(value, {
                        data: props.data,
                        entity: props.entity,
                        entityId: props.entityId,
                        eventData: props.eventData,
                        message: props.message,
                        prevEntity: props.prevEntity,
                        results: props.results,
                    });
                } catch (e) {
                    throw new Error(`JSONata Error: ${e.message}`);
                }
                break;
            case 'num':
                val = Number(value);
                break;
            case 'none':
                val = undefined;
                break;
            case 'config': {
                const config = {
                    ...this.nodeConfig,
                    server: this.nodeConfig.server.id,
                };
                val = value.length ? selectn(value, config) : config;
                break;
            }
            case 'data':
            case 'entity':
            case 'entityState':
            case 'eventData':
            case 'headers':
            case 'params':
            case 'triggerId':
            case 'prevEntity':
            case 'results':
                val = props[valueType];
                break;
            default:
                val = value;
        }
        return val;
    }

    setCustomOutputs(properties = [], message, extras) {
        properties.forEach((item) => {
            const value = this.getTypedInputValue(item.value, item.valueType, {
                message,
                ...extras,
            });

            try {
                this.setContextValue(
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
