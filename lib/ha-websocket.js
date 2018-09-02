'use strict';
const utils = require('./utils');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('home-assistant:ws');
const homeassistant = require('home-assistant-js-websocket');
const WebSocket = require('ws');

const MSG_TYPE_AUTH_REQUIRED = 'auth_required';
const MSG_TYPE_AUTH_INVALID = 'auth_invalid';
const MSG_TYPE_AUTH_OK = 'auth_ok';

class HaWebsocket extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.connected = false;
        this.states = {};
        this.services = {};

        this.setMaxListeners(0);
    }

    async startListening(eventOpts = {}) {
        this.config.websocket.includeRegex = eventOpts.includeRegex || this.config.websocket.includeRegex;
        this.config.websocket.excludeRegex = eventOpts.excludeRegex || this.config.websocket.excludeRegex;

        try {
            this.client = await homeassistant.createConnection({
                auth: this.config,
                createSocket: this.createSocket
            }).then(this.onClientOpen());
        } catch (e) {
            this.connected = false;
            this.emit('ha_events:close');
            return false;
        }

        this.client.addEventListener('ready', this.onClientOpen.bind(this));
        this.client.addEventListener('disconnected', this.onClientClose.bind(this));
        this.client.addEventListener('reconnect-error', this.onClientError.bind(this));

        this.client.subscribeEvents(ent => this.onClientEvents(ent));

        homeassistant.subscribeEntities(this.client, ent => this.onClientStates(ent));
        homeassistant.subscribeServices(this.client, ent => this.onClientServices(ent));

        if (!this.config.legacy) {
            homeassistant.getUser(this.client).then(msg => debug('[Account Name] ' + msg.name));
        }

        return true;
    }

    onClientStates(msg) {
        if (!msg) {
            return;
        }

        this.states = msg;
    }

    onClientServices(msg) {
        if (!msg) {
            return;
        }

        this.services = msg;
    }

    onClientEvents(msg) {
        if (!msg || !msg.data || msg.data === 'ping') {
            return;
        }

        if (msg) {
            const eventType = msg.event_type;
            const entityId = (msg.data) ? msg.data.entity_id : null;
            const {
                excludeRegex,
                includeRegex
            } = this.config.websocket;

            const emitEvent = {
                event_type: eventType,
                entity_id: entityId,
                event: msg.data
            };

            // If entity_id was found but is excluded by configured filter then stop further processing
            if (entityId && !(utils.shouldInclude(entityId, includeRegex, excludeRegex))) {
                debug('Skipping entity as entityId was excluded by includeRegex or excludeRegex config option');
                return;
            }

            // Emit on all channel
            this.emit('ha_events:all', emitEvent);

            // Emit on the event type channel
            if (emitEvent.event_type) {
                this.emit(`ha_events:${msg.event_type}`, emitEvent);
            }

            // Most specific emit for event_type and entity_id
            if (emitEvent.event_type && emitEvent.entity_id) {
                if (emitEvent.event_type === 'state_changed' && emitEvent.event && emitEvent.event.new_state) {
                    this.states[emitEvent.entity_id] = emitEvent.event.new_state;
                }

                this.emit(`ha_events:${msg.event_type}:${emitEvent.entity_id}`, emitEvent);
            }
        }
    }

    onClientOpen() {
        this.connected = true;
        this.emit('ha_events:open');
    }

    onClientClose() {
        this.closeClient(null, 'events connection closed, cleaning up connection');
    }

    onClientError(data) {
        this.closeClient(data, 'events connection error, cleaning up connection');
    }

    closeClient(err, logMsg) {
        if (logMsg) {
            debug(logMsg);
        }
        if (err) {
            debug(err);
            this.emit('ha_events:error', err);
        }
        debug(this.client);
        if (this.client && this.client.readyState === this.client.CLOSED) {
            this.connected = false;
            this.emit('ha_events:close');
        }
    }

    async getStates(entityId, forceRefresh = false) {
        if (Object.keys(this.states).length === 0 || forceRefresh) {
            // TODO: handle forceRefresh and empty state object
        }

        return (entityId) ? this.states[entityId] || null : this.states;
    }

    async getServices(forceRefresh = false) {
        if (forceRefresh) {
            // TODO: handle forceRefresh and empty state object
        }
        return this.services;
    }

    async callService(domain, service, data) {
        const result = homeassistant.callService(this.client, domain, service, data);

        return result;
    }

    /*
     * Pretty much a copy from https://github.com/home-assistant/home-assistant-js-websocket
     */
    createSocket() {
        if (!this.auth.baseUrl) {
            throw homeassistant.ERR_HASS_HOST_REQUIRED;
        }

        // Convert from http:// -> ws://, https:// -> wss://
        const url = `ws${this.auth.baseUrl.substr(4)}/api/websocket`;
        const authObj = {
            type: 'auth'
        };

        // this.auth.legacy = true;
        authObj[this.auth.legacy ? 'api_password' : 'access_token'] = this.auth.apiPass;

        debug('[Auth phase] Initializing', url);

        function connect(promResolve, promReject) {
            debug('[Auth Phase] New connection', url);
            const socket = new WebSocket(url);

            // If invalid auth, we will not try to reconnect.
            let invalidAuth = false;

            const onOpen = async (event) => {
                try {
                    socket.send(JSON.stringify(authObj));
                } catch (err) {
                    invalidAuth = err === homeassistant.ERR_INVALID_AUTH;
                    socket.close();
                }
            };

            const onMessage = async (event) => {
                const message = JSON.parse(event.data);

                debug('[Auth Phase] Received', message);

                switch (message.type) {
                case MSG_TYPE_AUTH_INVALID:
                    invalidAuth = true;
                    socket.close();
                    break;

                case MSG_TYPE_AUTH_OK:
                    socket.removeEventListener('open', onOpen);
                    socket.removeEventListener('message', onMessage);
                    socket.removeEventListener('close', onClose);
                    socket.removeEventListener('error', onClose);
                    promResolve(socket);
                    break;

                default:
                    if (message.type !== MSG_TYPE_AUTH_REQUIRED) {
                        debug('[Auth phase] Unhandled message', message);
                    }
                }
            };

            const onClose = () => {
                // If we are in error handler make sure close handler doesn't also fire.
                socket.removeEventListener('close', onClose);
                if (invalidAuth) {
                    promReject(homeassistant.ERR_INVALID_AUTH);
                    return;
                }

                // Try again in a second
                setTimeout(() => connect(promResolve, promReject), 2000);
            };

            socket.addEventListener('open', onOpen);
            socket.addEventListener('message', onMessage);
            socket.addEventListener('close', onClose);
            socket.addEventListener('error', onClose);
        }

        return new Promise((resolve, reject) =>
            connect(resolve, reject)
        );
    }
}

module.exports = HaWebsocket;
