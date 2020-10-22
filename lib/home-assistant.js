'use strict';
const debug = require('debug')('home-assistant');

const HaHttp = require('./ha-http');
const HaWebsocket = require('./ha-websocket');

const DEFAULTS = {
    baseUrl: null,
    apiPass: null,
    api: {},
    legacy: false,
    rejectUnauthorizedCerts: true,
    websocket: {
        retries: {
            maxAttempts: -1, // How many times to retry connection
            delay: 5000, // Delay this long before retry (in ms)
        },
    },
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

    getEntities() {
        const states = this.getStates();
        const entities = Object.keys(states).sort();

        return entities;
    }

    getStates(entityId) {
        return this.websocket.getStates(entityId);
    }

    getServices() {
        return this.websocket.getServices();
    }
}

module.exports = HomeAssistant;
