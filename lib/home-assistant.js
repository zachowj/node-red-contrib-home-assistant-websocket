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
        this.http = new HaHttp(this.config);
        this.websocket = new HaWebsocket(this.config);
        this.eventsList = {};
    }

    async connect() {
        if (!this.config.baseUrl) {
            throw new Error('Base URL needs to be set');
        }
        if (!/^https?:\/\//.test(this.config.baseUrl)) {
            throw new Error(
                'Invalid Base Url. Needs to start with http:// or https://'
            );
        }

        await this.websocket.connect();
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
