'use strict';
const debug = require('debug')('home-assistant');
const HaWebsocket = require('./ha-websocket');
const HaHttp = require('./ha-http');

const DEFAULTS = {
    baseUrl: null,
    apiPass: null,
    api: {},
    legacy: false,
    rejectUnauthorizedCerts: true,
    websocket: {
        includeRegex: null, // Include/Exclude allows for suppressing events by regex matches
        excludeRegex: null,
        retries: {
            maxAttempts: -1, // How many times to retry connection
            delay: 5000 // Delay this long before retry (in ms)
        }
    }
};

class HomeAssistant {
    constructor(config) {
        debug('Instantiating HomeAssistant');
        this.config = Object.assign({}, DEFAULTS, config);
        this.api = new HaHttp(this.config);
        this.websocket = new HaWebsocket(this.config);
    }

    async startListening({ includeRegex, excludeRegex } = {}) {
        if (!this.config.baseUrl) {
            throw new Error('Home Assistant URL not set');
        }
        this.config.websocket.includeRegex = includeRegex;
        this.config.websocket.excludeRegex = excludeRegex;

        let isWebsocketConnected = await this.websocket.startListening();
        if (!isWebsocketConnected) {
            debug('Invalid access token or password for websocket');
            throw new Error('Invalid access token or password.');
        }

        return this;
    }

    async getEntities() {
        const states = await this.getStates().then(states => {
            const entities = Object.keys(states);

            return entities.sort();
        });

        return states;
    }

    async getStates(entityId, forceRefresh = false) {
        const states = await this.websocket.getStates(entityId, forceRefresh);

        return states;
    }

    async getServices(forceRefresh = false) {
        const services = await this.websocket.getServices(forceRefresh);

        return services;
    }
}

module.exports = HomeAssistant;
