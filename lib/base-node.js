const Joi = require('joi');
const merge = require('lodash.merge');
const selectn = require('selectn');

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
        this.debug('Incoming message: ', message);
        if (this.options.debug) this.flashStatus();
        try {
            const parsedMessage = _internals.parseInputMessage.call(this, this.options.input, message);

            this.onInput({
                parsedMessage,
                message
            });
        } catch (e) {
            if (e && e.isJoi) {
                this.setStatusError('Validation Error, flow halted');
                this.node.warn(e.message);
                return this.send(null);
            }
            throw e;
        }
    },
    async preOnClose(removed, done) {
        if (removed) {
            this.debug('Closing node. Reason: Deleted');
        } else {
            this.debug('Closing node. Reason: Restarted');
        }
        await this.onClose(removed);
        // Clear previous status messages
        this.setStatus();
        done();
    }
};

const DEFAULT_OPTIONS = {
    debug:  false,
    config: {},
    input:  {
        topic:   { messageProp: 'topic'   },
        payload: { messageProp: 'payload' }
    }
};

class BaseNode {
    constructor(nodeDefinition, RED, options = {}) {
        // Need to bring in NodeRed dependency and properly extend Node class, or just make this class a node handler
        RED.nodes.createNode(this, nodeDefinition);
        this.node = this;

        this.RED            = RED;
        this.options        = merge({}, DEFAULT_OPTIONS, options);
        this._eventHandlers = _eventHandlers;
        this._internals     = _internals;

        this.nodeConfig = Object.entries(this.options.config).reduce((acc, [key, config]) => {
            acc[key] = config.isNode ? this.RED.nodes.getNode(nodeDefinition[key]) : nodeDefinition[key];
            return acc;
        }, {});

        this.node.on('input', this._eventHandlers.preOnInput.bind(this));
        this.node.on('close', this._eventHandlers.preOnClose.bind(this));

        this.debug('Instantiated Node with node config and basenode options: ', this.nodeConfig, this.options);
    }

    // Subclasses should override these as hooks into common events
    onClose(removed) {}
    onInput() {}

    send() { this.node.send(...arguments) }

    flashFlowHaltedStatus() {
        this.flashStatus({
            statusFlash: { fill: 'yellow', shape: 'dot' },
            statusAfter: { fill: 'yellow', shape: 'dot', text: `${new Date().toISOString()}: Node halted flow` },
            clearAfter:  5000
        });
    }

    flashStatus(flashOptions = {}) {
        const flashOpts  = Object.assign({}, { statusFlash: null, statusAfter: {}, clearAfter: 0 }, flashOptions);
        this.statusClear();

        let hide = () => this.node.status({});
        let show = (status) => this.node.status(status || { shape: 'dot', fill: 'grey' });

        let showing = false;
        this.timersStatusFlash = setInterval(() => {
            (showing) ? hide() : show(flashOpts.statusFlash);
            showing = !showing;
        }, 100);

        this.timersStatusFlashStop = setTimeout(() => {
            clearInterval(this.timersStatusFlash);
            show(flashOpts.statusAfter);
            this.timersStatusClear = setTimeout(() => hide(), flashOpts.clearAfter);
        }, 1000);
    };

    // Cancel any timers associated with and blank out the status
    statusClear() {
        clearInterval(this.timersStatusFlash);
        clearTimeout(this.timersStatusFlashStop);
        clearTimeout(this.timersStatusClear);
        this.node.status({});
    }

    setStatusError(msg) {
        this.setStatus({ fill: 'red', shape: 'ring', text: msg });
    }

    setStatus(opts = { shape: 'dot', fill: 'blue', text: '' }) {
        this.node.status(opts);
    }

    debug() {
        if (!this.options.debug) return;
        console.log(`*****DEBUG: ${this.node.type}:${this.node.id}`, ...arguments);
    }
}

module.exports = BaseNode;
