const Joi = require('joi');
const merge = require('lodash.merge');
const selectn = require('selectn');
const dateFns = require('date-fns');

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const utils = {
    selectn,
    merge,
    Joi,
    reach: (path, obj) => selectn(path, obj),
    formatDate: date => dateFns.format(date, 'ddd, h:mm:ss A'),
    toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return '';
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }
};

const DEFAULT_OPTIONS = {
    config: {
        debugenabled: {},
        name: {},
        server: { isNode: true }
    },
    input: {
        topic: { messageProp: 'topic' },
        payload: { messageProp: 'payload' }
    }
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
        this.utils = utils;

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

        const name = this.reach('nodeConfig.name');
        this.debug(`instantiated node, name: ${name || 'undefined'}`);
    }

    async getDb() {
        try {
            if (DB) return DB;

            let dbLocation = this.RED.settings.userDir;
            if (!dbLocation)
                throw new Error(
                    'Could not find userDir to use for database store'
                );
            dbLocation += '/node-red-contrib-home-assistant-websocket.json';

            const adapter = new FileAsync(dbLocation);
            DB = await low(adapter);
            DB.defaults({ nodes: {} });
            return DB;
        } catch (e) {
            throw e;
        }
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
        return db.remove(this.nodeDbId).write();
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
            len: 1
        };

        let pos = 0;
        for (let i = 0; i < data.length; i++) {
            message.payload = data.slice(pos, pos + 1)[0];
            message.parts.index = i;
            pos += 1;
            this.send(this.RED.util.cloneMessage(message));
        }
    }

    setStatus(opts = { shape: 'dot', fill: 'blue', text: '' }) {
        this.node.status(opts);
    }

    updateConnectionStatus(additionalText) {
        this.setConnectionStatus(this.connectionState, additionalText);
    }

    setConnectionStatus(state, additionalText) {
        let connectionStatus;
        switch (state) {
            case this.eventsClient.CONNECTING:
                connectionStatus = {
                    shape: 'ring',
                    fill: 'yellow',
                    text: 'connecting'
                };
                break;
            case this.eventsClient.CONNECTED:
                connectionStatus = {
                    shape: 'dot',
                    fill: 'green',
                    text: 'connected'
                };
                break;
            default:
                connectionStatus = {
                    shape: 'ring',
                    fill: 'red',
                    text: 'disconnected'
                };
        }
        if (this.hasOwnProperty('isenabled') && this.isenabled === false) {
            connectionStatus.text += '(DISABLED)';
        }

        if (additionalText) connectionStatus.text += ` ${additionalText}`;

        this.setStatus(connectionStatus);
    }

    // Hack to get around the fact that node-red only sends warn / error to the debug tab
    debugToClient(debugMsg) {
        if (!this.nodeConfig.debugenabled) return;
        for (let msg of arguments) {
            const debugMsgObj = {
                id: this.id,
                name: this.name || '',
                msg
            };
            this.RED.comms.publish('debug', debugMsgObj);
        }
    }

    debug() {
        super.debug(...arguments);
    }

    get eventsClient() {
        return this.reach('nodeConfig.server.websocket');
    }

    get isConnected() {
        return (
            this.eventsClient &&
            this.eventsClient.connectionState === this.eventsClient.CONNECTED
        );
    }

    get connectionState() {
        return this.eventsClient && this.eventsClient.connectionState;
    }

    // Returns the evaluated path on this class instance
    // ex: myNode.reach('nodeConfig.server.events')
    reach(path) {
        return selectn(path, this);
    }

    getPrettyDate() {
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric'
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
            case 'habool':
                const haBoolean =
                    this.nodeConfig.server.nodeConfig.ha_boolean === undefined
                        ? `^(y|yes|true|on|home|open)$`
                        : `^(${this.nodeConfig.server.nodeConfig.ha_boolean})$`;
                return new RegExp(haBoolean, 'i').test(value);
            case 're':
                return new RegExp(value);
            case 'list':
                return value.split(',');
            default:
                return value;
        }
    }

    async getComparatorResult(
        comparatorType,
        comparatorValue,
        actualValue,
        comparatorValueDatatype
    ) {
        if (
            comparatorType === 'includes' ||
            comparatorType === 'does_not_include'
        ) {
            comparatorValueDatatype = 'list';
        }
        if (comparatorValueDatatype === 'bool') {
            comparatorValue = comparatorValue === 'true';
        }

        const cValue = this.getCastValue(
            comparatorValueDatatype,
            comparatorValue
        );

        switch (comparatorType) {
            case 'is':
            case 'is_not':
                // Datatype might be num, bool, str, re (regular expression)
                const isMatch =
                    comparatorValueDatatype === 're'
                        ? cValue.test(actualValue)
                        : cValue === actualValue;
                return comparatorType === 'is' ? isMatch : !isMatch;
            case 'includes':
            case 'does_not_include':
                const isIncluded = cValue.includes(actualValue);
                return comparatorType === 'includes' ? isIncluded : !isIncluded;
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
            case 'in_group':
                const entity = await this.nodeConfig.server.homeAssistant.getStates(
                    cValue
                );
                const groupEntities =
                    this.utils.reach('attributes.entity_id', entity) || [];
                return groupEntities.includes(actualValue);
        }
    }
}

const _internals = {
    parseInputMessage(inputOptions, msg) {
        if (!inputOptions) return;
        let parsedResult = {};

        for (let [fieldKey, fieldConfig] of Object.entries(inputOptions)) {
            // Try to load from message
            let result = {
                key: fieldKey,
                value: selectn(fieldConfig.messageProp, msg),
                source: 'message',
                validation: null
            };

            // If message missing value and node has config that can be used instead
            if (result.value === undefined && fieldConfig.configProp) {
                result.value = selectn(fieldConfig.configProp, this.nodeConfig);
                result.source = 'config';
            }

            if (!result.value && fieldConfig.default) {
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
                const { error, value } = Joi.validate(
                    result.value,
                    fieldConfig.validation.schema,
                    { convert: true }
                );
                if (error && fieldConfig.validation.haltOnFail) throw error;
                result.validation = { error, value };
            }

            // Assign result to config key value
            parsedResult[fieldKey] = result;
        }

        return parsedResult;
    }
};

const _eventHandlers = {
    preOnInput(message) {
        try {
            const parsedMessage = _internals.parseInputMessage.call(
                this,
                this.options.input,
                message
            );

            this.onInput({
                parsedMessage,
                message
            });
        } catch (e) {
            if (e && e.isJoi) {
                this.node.warn(e.message);
                return this.send(null);
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
    }
};

module.exports = BaseNode;
