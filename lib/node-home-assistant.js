'use strict';
const debug    = require('debug')('home-assistant');
const HaEvents = require('./ha-events');
const HaApi    = require('./ha-api');

const DEFAULTS = {
    baseUrl: null,
    apiPass: null,
    api:     {},
    events:  {
        includeRegex: null,        // Include/Exclude allows for suppressing events by regex matches
        excludeRegex: null,
        transport:    'sse',       // For future support of websockets
        retries:      {
            maxAttempts: 10,    // How many times to retry connection
            delay:       5000   // Delay this long before retry (in ms)
        }
    }
};

class HomeAssistant {
    constructor(config, { startListening } = {}) {
        debug('Instantiating HomeAssistant');
        this.config = Object.assign({}, DEFAULTS, config);
        this.api    = new HaApi(this.config);
        this.events = new HaEvents(this.config);

        if (startListening) { this.startListening(); }
    }

    static async testConnection({ baseUrl, apiPass }) {
        const apiTest = new HaApi({ baseUrl, apiPass });
        try {
            await apiTest.getConfig();
            return true;
        } catch (e) {
            return false;
        }
    }

    async startListening ({ includeRegex, excludeRegex } = {}) {
        if (!this.config.baseUrl) { throw new Error ('Home Assistant URL not set'); }
        this.config.events.includeRegex = includeRegex;
        this.config.events.excludeRegex = excludeRegex;

        const isConnectionWorking = await HomeAssistant.testConnection(this.config);
        if (!isConnectionWorking) {
            throw new Error(`Connection to home assistant could not be established with config: ${this.config.baseUrl} ${(this.config.apiPass) ? '<password redacted>' : '<password not used>'}`);
        }

        this.events.startListening();
        this.events.on('ha_events:state_changed', (evt) => this._onStateChanged(evt));
        return this;
    }

    async getStates (entityId, forceRefresh = false) {
        if (!this.states || forceRefresh) {
            this.states = await this.api.getStates();
        }
        return (entityId)
            ? this.states[entityId] || null
            : this.states;
    }

    async getServices (forceRefresh = false) {
        if (!this.availableServices || forceRefresh) {  this.availableServices = await this.api.getServices(); }
        return this.availableServices;
    }

    async getEvents (forceRefresh) {
        if (!this.availableEvents || forceRefresh) { this.availableEvents = await this.api.getEvents(); }
        return this.availableEvents;
    }

    // Caches state changes for entities
    async _onStateChanged (changedEntity) {
        try {
            const states = await this.getStates();
            states[changedEntity.entity_id] = changedEntity.event.new_state;
        } catch (e) {
            throw e;
        }
    }
}




module.exports = HomeAssistant;
