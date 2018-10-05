'use strict';
const debug = require('debug')('home-assistant');
const HaWebsocket = require('./ha-websocket');
const HaApi = require('./ha-api');

const DEFAULTS = {
    baseUrl: null,
    apiPass: null,
    api: {},
    legacy: false,
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
        this.api = new HaApi(this.config);
        this.websocket = new HaWebsocket(this.config);
    }

    static async testConnection({ baseUrl, apiPass, legacy }) {
        const apiTest = new HaApi({
            baseUrl,
            apiPass,
            legacy
        });
        try {
            debug('[Testing REST] REST Connection');
            this.haConfig = await apiTest.getConfig();
            return true;
        } catch (e) {
            return e;
        }
    }

    async startListening({ includeRegex, excludeRegex } = {}) {
        if (!this.config.baseUrl) {
            throw new Error('Home Assistant URL not set');
        }
        this.config.websocket.includeRegex = includeRegex;
        this.config.websocket.excludeRegex = excludeRegex;

        let isWebsocketConnected = await HaWebsocket.testConnection(
            this.config
        );
        if (isWebsocketConnected !== true) {
            if (isWebsocketConnected.code) {
                debug(`[Testing WS] ${isWebsocketConnected.toString()}`);
                throw new Error(
                    `Connecting to ${isWebsocketConnected.address}:${
                        isWebsocketConnected.port
                    } - Code: ${isWebsocketConnected.code}`
                );
            }

            debug('Invalid access token or password for websocket');
            throw new Error('[Testing WS] Invalid access token or password.');
        } else {
            debug('[Testing WS] WebSocket Connection Good');
        }

        const isConnectionWorking = await HomeAssistant.testConnection(
            this.config
        );
        if (isConnectionWorking !== true) {
            if (isConnectionWorking.code) {
                debug(`[Testing REST] ${JSON.stringify(isConnectionWorking)}`);
                throw new Error(
                    `Errpr connecting to ${isConnectionWorking.address}:${
                        isConnectionWorking.port
                    } - Code: ${isConnectionWorking.code}`
                );
            }

            debug('Invalid access token or password for http');
            throw new Error('[Testing REST] Invalid access token or password.');
        } else {
            debug('[Testing REST] REST Connection Good');
        }

        isWebsocketConnected = await this.websocket.startListening();
        if (!isWebsocketConnected) {
            debug('Invalid access token or password for websocket');
            throw new Error(
                '[Home Assistant WS] Invalid access token or password.'
            );
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
