const debug = require('debug')('home-assistant');
const selectn = require('selectn');

const { STATE_CONNECTED } = require('../const');

const websocketMethods = [
    'callService',
    'connect',
    'getServices',
    'getStates',
    'getUser',
    'send',
    'subscribeMessage',
];
const httpMethods = [
    'fireEvent',
    'get',
    'getHistory',
    'post',
    'renderTemplate',
];

class HomeAssistant {
    constructor({ websocketAPI, httpAPI, eventBus }) {
        debug('Instantiating HomeAssistant');
        this.eventBus = eventBus;
        this.http = httpAPI;
        this.websocket = websocketAPI;
        this.eventsList = {};

        this.exposeMethods(this.websocket, websocketMethods);
        this.exposeMethods(this.http, httpMethods);
    }

    get isConnected() {
        return this.websocket.connectionState === STATE_CONNECTED;
    }

    get isHomeAssistantRunning() {
        return this.isConnected && this.websocket.isHomeAssistantRunning;
    }

    get integrationVersion() {
        return this.websocket.integrationVersion;
    }

    get isIntegrationLoaded() {
        return this.integrationVersion !== 0;
    }

    get connectionState() {
        return this.websocket.connectionState;
    }

    exposeMethods(cls, methods) {
        methods.forEach((method) => {
            if (typeof cls[method] === 'function') {
                this[method] = cls[method].bind(cls);
            }
        });
    }

    getEntities() {
        const states = this.getStates();
        const entities = Object.keys(states).sort();

        return entities;
    }

    getTags() {
        return selectn('websocket.tags', this) || [];
    }

    async updateTags() {
        await this.websocket.updateTagList();
    }

    subscribeEvents() {
        return this.websocket.subscribeEvents(this.eventsList);
    }

    close() {
        this.websocket.closeClient();
    }

    addListener(event, handler, options = { once: false }) {
        if (options.once === true) {
            this.eventBus.once(event, handler);
        } else {
            this.eventBus.on(event, handler);
        }
    }

    removeListener(event, handler) {
        this.eventBus.removeListener(event, handler);
    }
}

module.exports = HomeAssistant;
