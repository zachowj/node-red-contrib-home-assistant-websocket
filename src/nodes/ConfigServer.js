const merge = require('lodash.merge');

const { createHomeAssistantClient } = require('../homeAssistant');
const { INTEGRATION_NOT_LOADED } = require('../const');
const { toCamelCase } = require('../helpers/utils');

const nodeDefaults = {
    name: {},
    version: (nodeDef) => nodeDef.version || 0,
    legacy: {},
    addon: {},
    rejectUnauthorizedCerts: {},
    ha_boolean: {},
    connectionDelay: {},
    cacheJson: {},
};

class ConfigServer {
    constructor({ node, config, RED }) {
        this.node = node;
        this.RED = RED;
        this.config = merge({}, nodeDefaults, config);
        this.exposedNodes = [];

        this.setOnContext('states', []);
        this.setOnContext('services', []);
        this.setOnContext('isConnected', false);

        node.on('close', this.onClose.bind(this));
    }

    async init() {
        try {
            this.homeAssistant = createHomeAssistantClient(
                this.config,
                this.node.credentials
            );

            this.startListeners();

            await this.homeAssistant.connect();
        } catch (e) {
            this.node.error(
                this.RED._(e.message, { base_url: this.node.credentials.host })
            );
        }
    }

    startListeners() {
        // Setup event listeners
        const events = {
            'ha_client:close': this.onHaEventsClose,
            'ha_client:open': this.onHaEventsOpen,
            'ha_client:connecting': this.onHaEventsConnecting,
            'ha_client:error': this.onHaEventsError,
            'ha_client:running': this.onHaEventsRunning,
            'ha_client:states_loaded': this.onHaStatesLoaded,
            'ha_client:services_loaded': this.onHaServicesLoaded,
            'ha_events:state_changed': this.onHaStateChanged,
            integration: this.onIntegrationEvent,
        };
        Object.entries(events).forEach(([event, callback]) =>
            this.homeAssistant.addListener(event, callback.bind(this))
        );
        this.homeAssistant.addListener(
            'ha_client:connected',
            this.registerEvents.bind(this),
            { once: true }
        );
    }

    get nameAsCamelcase() {
        return toCamelCase(this.config.name);
    }

    setOnContext(key, value) {
        let haCtx = this.node.context().global.get('homeassistant');
        haCtx = haCtx || {};
        haCtx[this.nameAsCamelcase] = haCtx[this.nameAsCamelcase] || {};
        haCtx[this.nameAsCamelcase][key] = value;
        this.node.context().global.set('homeassistant', haCtx);
    }

    getFromContext(key) {
        let haCtx = this.node.context().global.get('homeassistant');
        haCtx = haCtx || {};
        return haCtx[this.nameAsCamelcase]
            ? haCtx[this.nameAsCamelcase][key]
            : null;
    }

    onHaEventsOpen() {
        this.setOnContext('isConnected', true);

        this.node.log(`Connected to ${this.node.credentials.host}`);
    }

    onHaStateChanged(changedEntity) {
        const states = this.getFromContext('states');
        if (states) {
            states[changedEntity.entity_id] = changedEntity.event.new_state;
            this.setOnContext('states', states);
        }
    }

    onHaStatesLoaded(states) {
        this.setOnContext('states', states);
        this.node.debug('States Loaded');
    }

    onHaServicesLoaded(services) {
        this.setOnContext('services', services);
        this.node.debug('Services Loaded');
    }

    onHaEventsConnecting() {
        this.setOnContext('isConnected', false);
        this.setOnContext('isRunning', false);
        this.node.log(`Connecting to ${this.node.credentials.host}`);
    }

    onHaEventsClose() {
        if (this.getFromContext('isConnected')) {
            this.node.log(`Connection closed to ${this.node.credentials.host}`);
        }
        this.setOnContext('isConnected', false);
        this.setOnContext('isRunning', false);
    }

    onHaEventsRunning() {
        this.setOnContext('isRunning', true);
        this.node.debug(`HA State: running`);
    }

    onHaEventsError(err) {
        this.setOnContext('isConnected', false);
        this.setOnContext('isRunning', false);
        this.node.debug(err);
    }

    // Close WebSocket client on redeploy or node-RED shutdown
    onClose(removed, done) {
        if (this.homeAssistant) {
            this.node.log(
                `Closing connection to ${this.node.credentials.host}`
            );
            if (removed) {
                this.homeAssistant.close();
            }
        }
        done();
    }

    onIntegrationEvent(eventType) {
        if (
            eventType === INTEGRATION_NOT_LOADED &&
            !this.isHomeAssistantRunning
        ) {
            return;
        }
        this.node.debug(`Integration: ${eventType}`);
    }

    registerEvents() {
        this.homeAssistant.subscribeEvents();
    }
}

module.exports = ConfigServer;
