const FileAsync = require('lowdb/adapters/FileAsync');
const low = require('lowdb');
const merge = require('lodash.merge');
const selectn = require('selectn');

const { toCamelCase } = require('./utils');

const DEFAULT_OPTIONS = {
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

let DB;

class BaseNode {
    constructor(nodeDefinition, RED, options = {}) {
        // Need to bring in NodeRed dependency and properly extend Node class, or just make this class a node handler
        RED.nodes.createNode(this, nodeDefinition);
        this.node = this;

        this.RED = RED;
        this.options = merge({}, DEFAULT_OPTIONS, options);
        this._eventHandlers = _eventHandlers;
        this._internals = _internals;

        this.nodeConfig = Object.entries(this.options.config).reduce(
            (acc, [key, config]) => {
                if (config.isNode) {
                    acc[key] = this.RED.nodes.getNode(nodeDefinition[key]);
                } else if (typeof config === 'function') {
                    acc[key] = config.call(this, nodeDefinition);
                } else {
                    acc[key] = nodeDefinition[key];
                }

                return acc;
            },
            {}
        );

        this.node.on('input', this._eventHandlers.preOnInput.bind(this));
        this.node.on('close', this._eventHandlers.preOnClose.bind(this));

        const name = selectn('nodeConfig.name', this);
        this.debug(`instantiated node, name: ${name || 'undefined'}`);
    }

    async getDb() {
        if (DB) return DB;

        let dbLocation = this.RED.settings.userDir;
        if (!dbLocation)
            throw new Error('Could not find userDir to use for database store');
        dbLocation += '/node-red-contrib-home-assistant-websocket.json';

        const adapter = new FileAsync(dbLocation);
        DB = await low(adapter);
        DB.defaults({
            nodes: {},
        });
        return DB;
    }

    // Subclasses should override these as hooks into common events
    onClose(removed) {}

    onInput() {}

    get nodeDbId() {
        return `nodes.${this.id.replace('.', '_')}`;
    }

    // namespaces data by nodeid to the lowdb store
    async saveNodeData(key, value) {
        if (!this.id || !key)
            throw new Error('cannot persist data to db without id and key');
        const path = `${this.nodeDbId}.${key}`;
        const db = await this.getDb();
        return db.set(path, value).write();
    }

    async getNodeData(key) {
        if (!this.id)
            throw new Error('cannot get node data from db without id');
        const db = await this.getDb();
        let path = `${this.nodeDbId}`;
        if (key) path = path + `.${key}`;

        return db.get(path).value();
    }

    async removeNodeData() {
        if (!this.id)
            throw new Error('cannot get node data from db without id');
        const db = await this.getDb();
        return db.unset(this.nodeDbId).write();
    }

    send() {
        this.node.send(...arguments);
    }

    sendSplit(message, data) {
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
            this.send(this.RED.util.cloneMessage(message));
        }
    }

    setStatus(
        opts = {
            shape: 'dot',
            fill: 'blue',
            text: '',
        }
    ) {
        if (
            Object.prototype.hasOwnProperty.call(this, 'isEnabled') &&
            this.isEnabled === false
        ) {
            opts = {
                shape: 'dot',
                fill: 'grey',
                text: 'DISABLED',
            };
        }
        this.node.status(opts);
    }

    setStatusSuccess(text = 'Success') {
        this.setStatus({
            fill: 'green',
            shape: 'dot',
            text: `${text} at: ${this.getPrettyDate()}`,
        });
    }

    setStatusSending(text = 'Sending') {
        this.setStatus({
            fill: 'yellow',
            shape: 'dot',
            text: `${text} at: ${this.getPrettyDate()}`,
        });
    }

    setStatusFailed(text = 'Failed') {
        this.setStatus({
            fill: 'red',
            shape: 'ring',
            text: `${text} at: ${this.getPrettyDate()}`,
        });
    }

    updateConnectionStatus(additionalText) {
        this.setConnectionStatus(additionalText);
    }

    getConnectionStatus() {
        const connectionStatus = {
            shape: 'ring',
            fill: 'red',
            text: 'node-red:common.status.disconnected',
        };

        if (this.websocketClient) {
            if (this.websocketClient.isHomeAssistantRunning) {
                connectionStatus.fill = 'green';
                connectionStatus.text = 'running';
                return connectionStatus;
            }

            switch (this.connectionState) {
                case this.websocketClient.CONNECTING:
                    connectionStatus.fill = 'yellow';
                    connectionStatus.text = 'node-red:common.status.connecting';
                    break;
                case this.websocketClient.CONNECTED:
                    connectionStatus.fill = 'green';
                    connectionStatus.text = 'node-red:common.status.connected';
                    break;
                case this.websocketClient.ERROR:
                    connectionStatus.text = 'node-red:common.status.error';
                    break;
            }
        }

        return connectionStatus;
    }

    setConnectionStatus(additionalText) {
        let connectionStatus = this.getConnectionStatus();

        if (
            Object.prototype.hasOwnProperty.call(this, 'isEnabled') &&
            this.isEnabled === false
        ) {
            connectionStatus = {
                shape: 'dot',
                fill: 'grey',
                text: 'DISABLED',
            };
        }

        if (additionalText) connectionStatus.text += ` ${additionalText}`;

        this.setStatus(connectionStatus);
    }

    // Hack to get around the fact that node-red only sends warn / error to the debug tab
    debugToClient(debugMsg) {
        if (!this.nodeConfig.debugenabled) return;
        for (const msg of arguments) {
            const debugMsgObj = {
                id: this.id,
                name: this.name || '',
                msg,
            };
            this.RED.comms.publish('debug', debugMsgObj);
        }
    }

    debug() {
        super.debug(...arguments);
    }

    get httpClient() {
        return selectn('nodeConfig.server.http', this);
    }

    get websocketClient() {
        return selectn('nodeConfig.server.websocket', this);
    }

    get isConnected() {
        return this.websocketClient && this.websocketClient.isConnected;
    }

    get connectionState() {
        return this.websocketClient && this.websocketClient.connectionState;
    }

    get isHomeAssistantRunning() {
        return this.isConnected && this.websocketClient.isHomeAssistantRunning;
    }

    get isIntegrationLoaded() {
        return this.isConnected && this.websocketClient.isIntegrationLoaded;
    }

    getPrettyDate() {
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
        });
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
                const haBoolean =
                    this.nodeConfig.server.nodeConfig.ha_boolean === undefined
                        ? `^(y|yes|true|on|home|open)$`
                        : `^(${this.nodeConfig.server.nodeConfig.ha_boolean})$`;
                return new RegExp(haBoolean, 'i').test(value);
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
        return this.context()[location].get(contextKey.key, contextKey.store);
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
                cValue = this.evaluateJSONata(
                    comparatorValue,
                    message,
                    entity,
                    prevEntity
                );
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
                return actualValue.startsWith(cValue);
            case 'in_group': {
                const ent = this.nodeConfig.server.homeAssistant.getStates(
                    cValue
                );
                const groupEntities =
                    selectn('attributes.entity_id', ent) || [];
                return groupEntities.includes(actualValue);
            }
            case 'jsonata':
                if (!cValue) return true;

                try {
                    return (
                        this.evaluateJSONata(
                            cValue,
                            message,
                            entity,
                            prevEntity
                        ) === true
                    );
                } catch (e) {
                    throw new Error(`JSONata Error: ${e.message}`);
                }
        }
    }

    evaluateJSONata(expression, message, entity, prevEntity) {
        const expr = this.RED.util.prepareJSONataExpression(
            expression,
            this.node
        );
        const serverName = toCamelCase(this.nodeConfig.server.name);

        expr.assign('entity', () => entity);
        expr.assign('prevEntity', () => prevEntity);
        expr.assign('entities', (val) => {
            const homeAssistant = this.node
                .context()
                .global.get('homeassistant')[serverName];
            if (homeAssistant === undefined) return undefined;
            return val ? homeAssistant.states[val] : homeAssistant.states;
        });

        return this.RED.util.evaluateJSONataExpression(expr, message);
    }

    getTypedInputValue(value, valueType, { message, entity }) {
        let val;
        switch (valueType) {
            case 'msg':
            case 'flow':
            case 'global':
                val = this.getContextValue(valueType, value, message);
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
                    val = this.evaluateJSONata(value, message, entity);
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
            default:
                val = value;
        }
        return val;
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

            this.onInput(
                {
                    parsedMessage,
                    message,
                },
                send,
                done
            );
        } catch (e) {
            if (e && e.isJoi) {
                this.node.setStatusFailed('Error');
                done(e.message);
                return;
            }
            throw e;
        }
    },

    async preOnClose(removed, done) {
        this.debug(
            `closing node. Reason: ${
                removed ? 'node deleted' : 'node re-deployed'
            }`
        );
        try {
            await this.onClose(removed);
            done();
        } catch (e) {
            this.error(e.message);
        }
    },
};

module.exports = BaseNode;
