const Joi     = require('joi');
const merge   = require('lodash.merge');
const selectn = require('selectn');
const dateFns = require('date-fns');

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const utils = {
    selectn,
    merge,
    Joi,
    reach:      (path, obj) => selectn(path, obj),
    formatDate: (date)      => dateFns.format(date, 'ddd, h:mm:ss A')
};

const DEFAULT_OPTIONS = {
    config: {
        debugenabled: {},
        name:         {},
        server:       { isNode: true }
    },
    input: {
        topic:   { messageProp: 'topic'   },
        payload: { messageProp: 'payload' }
    }
};

let DB;

class BaseNode {
    constructor(nodeDefinition, RED, options = {}) {
        // Need to bring in NodeRed dependency and properly extend Node class, or just make this class a node handler
        RED.nodes.createNode(this, nodeDefinition);
        this.node = this;

        this.RED            = RED;
        this.options        = merge({}, DEFAULT_OPTIONS, options);
        this._eventHandlers = _eventHandlers;
        this._internals     = _internals;
        this.utils          = utils;

        this.nodeConfig = Object.entries(this.options.config).reduce((acc, [key, config]) => {
            if (config.isNode) {
                acc[key] = this.RED.nodes.getNode(nodeDefinition[key]);
            } else if (typeof config === 'function') {
                acc[key] = config.call(this, nodeDefinition);
            } else {
                acc[key] = nodeDefinition[key];
            }

            return acc;
        }, {});

        this.node.on('input', this._eventHandlers.preOnInput.bind(this));
        this.node.on('close', this._eventHandlers.preOnClose.bind(this));

        const name = this.reach('nodeConfig.name');
        this.debug(`instantiated node, name: ${name || 'undefined'}`);
        this.updateConnectionStatus();
    }

    async getDb() {
        try {
            if (DB) return DB;

            let dbLocation = this.RED.settings.get('userDir');
            if (!dbLocation) throw new Error('Could not find userDir to use for database store');
            dbLocation += '/node-red-contrib-home-assistant.json';

            const adapter = new FileAsync(dbLocation);
            DB = await low(adapter);
            DB.defaults({ nodes: {} });
            return DB;
        } catch (e) { throw e }
    }

    // Subclasses should override these as hooks into common events
    onClose(removed) {}
    onInput() {}
    get nodeDbId() {
        return `nodes.${this.id.replace('.', '_')}`;
    }
    // namespaces data by nodeid to the lowdb store
    async saveNodeData(key, value) {
        if (!this.id || !key) throw new Error('cannot persist data to db without id and key');
        const path = `${this.nodeDbId}.${key}`;
        const db = await this.getDb();
        return db.set(path, value).write();
    }
    async getNodeData(key) {
        if (!this.id) throw new Error('cannot get node data from db without id');
        const db = await this.getDb();
        let path = `${this.nodeDbId}`;
        if (key) path = path + `.${key}`;

        return db.get(path).value();
    }
    async removeNodeData() {
        if (!this.id) throw new Error('cannot get node data from db without id');
        const db = await this.getDb();
        return db.remove(this.nodeDbId).write();
    }

    send() { this.node.send(...arguments) }

    setStatus(opts = { shape: 'dot', fill: 'blue', text: '' }) {
        this.node.status(opts);
    }

    updateConnectionStatus() {
        this.setConnectionStatus(this.isConnected);
    }

    setConnectionStatus(isConnected) {
        let connectionStatus = isConnected
            ? { shape: 'dot', fill: 'green', text: 'connected'   }
            : { shape: 'ring', fill: 'red', text: 'disconnected' };
        if (this.hasOwnProperty('isenabled') && this.isenabled === false) {
            connectionStatus.text += '(DISABLED)';
        }

        this.setStatus(connectionStatus);
    }

    // Hack to get around the fact that node-red only sends warn / error to the debug tab
    debugToClient(debugMsg) {
        if (!this.nodeConfig.debugenabled) return;
        for (let msg of arguments) {
            const debugMsgObj =  {
                id:   this.id,
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
        return this.reach('nodeConfig.server.events');
    }

    get isConnected() {
        return this.eventsClient && this.eventsClient.connected;
    }

    // Returns the evaluated path on this class instance
    // ex: myNode.reach('nodeConfig.server.events')
    reach(path) {
        return selectn(path, this);
    }
}

const _internals = {
    parseInputMessage(inputOptions, msg) {
        if (!inputOptions) return;
        let parsedResult = {};

        for (let [fieldKey, fieldConfig] of Object.entries(inputOptions)) {
            // Try to load from message
            let result = { key: fieldKey, value: selectn(fieldConfig.messageProp, msg), source: 'message', validation: null };

            // If message missing value and node has config that can be used instead
            if (result.value === undefined && fieldConfig.configProp) {
                result.value  = selectn(fieldConfig.configProp, this.nodeConfig);
                result.source = 'config';
            }

            if (!result.value && fieldConfig.default) {
                result.value = (typeof fieldConfig.default === 'function')
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
                const { error, value } = Joi.validate(result.value, fieldConfig.validation.schema, { convert: true });
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
        this.debugToClient('Incoming Message', message);
        this.debug('Incoming message: ', message);

        try {
            const parsedMessage = _internals.parseInputMessage.call(this, this.options.input, message);

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
        this.debug(`closing node. Reason: ${removed ? 'node deleted' : 'node re-deployed'}`);
        try {
            await this.onClose(removed);
            done();
        } catch (e) {
            this.error(e.message);
        }
    }
};

module.exports = BaseNode;
