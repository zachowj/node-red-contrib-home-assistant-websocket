const BaseNode = require('../../lib/base-node');
const HomeAssistant = require('../../lib/home-assistant');
const bonjour = require('bonjour')();
const flatten = require('flat');
const uniq = require('lodash.uniq');

module.exports = function(RED) {
    const httpHandlers = {
        disableCache: function(req, res, next) {
            if (this.nodeConfig.cacheJson === false) {
                res.setHeader('Surrogate-Control', 'no-store');
                res.setHeader(
                    'Cache-Control',
                    'no-store, no-cache, must-revalidate, proxy-revalidate'
                );
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            }
            next();
        },
        getEntities: function(req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            return this.homeAssistant
                .getEntities()
                .then(states => res.json(states))
                .catch(e => this.error(e.message));
        },
        getStates: function(req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            return this.homeAssistant
                .getStates()
                .then(states => res.json(states))
                .catch(e => this.error(e.message));
        },
        getServices: function(req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            return this.homeAssistant
                .getServices()
                .then(services => res.json(services))
                .catch(e => this.error(e.message));
        },
        getProperties: async function(req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            let flat = [];
            let singleEntity = !!req.query.entityId;

            try {
                var states = await this.homeAssistant.getStates(
                    req.query.entityId
                );

                if (!states) {
                    states = await this.homeAssistant.getStates();
                    singleEntity = false;
                }
            } catch (e) {
                this.error(e.message);
            }

            if (singleEntity) {
                flat = Object.keys(flatten(states)).filter(
                    e => e.indexOf(req.query.term) !== -1
                );
            } else {
                flat = Object.values(states).map(entity =>
                    Object.keys(flatten(entity))
                );
            }

            const uniqArray = uniq(
                [].concat(...flat).sort((a, b) => {
                    if (!a.includes('.') && b.includes('.')) return -1;
                    if (a.includes('.') && !b.includes('.')) return 1;
                    if (a < b) return -1;
                    if (a > b) return 1;

                    return 0;
                })
            );

            res.json(uniqArray);
        },
        getIntegrationVersion: function(req, res, next) {
            const data = { version: 0 };

            if (this.websocket && this.websocket.isConnected) {
                data.version = this.websocket.integrationVersion;
            }
            res.json(data);
        }
    };

    RED.httpAdmin.get('/homeassistant/discover', async function(req, res) {
        const instances = [];
        bonjour.find({ type: 'home-assistant' }, service => {
            instances.push({
                label: service.name
                    ? `${service.name} (${service.txt.base_url})`
                    : service.txt.base_url,
                value: service.txt.base_url
            });
        });

        // Add a bit of delay for all services to be discovered
        setTimeout(() => {
            res.json(instances);
        }, 3000);
    });

    const nodeOptions = {
        debug: true,
        config: {
            name: {},
            legacy: {},
            addon: {},
            rejectUnauthorizedCerts: {},
            ha_boolean: {},
            connectionDelay: {},
            cacheJson: {}
        }
    };

    class ConfigServerNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            // For backwards compatibility prior to v0.0.4 when loading url and pass from flow.json
            if (nodeDefinition.url) {
                this.credentials.host =
                    this.credentials.host || nodeDefinition.url;
                this.credentials.access_token =
                    this.credentials.access_token || nodeDefinition.pass;

                this.RED.nodes.addCredentials(this.id, this.credentials);
            }
            // Check if using HA Add-on and import proxy token
            const addonBaseUrls = [
                'http://hassio/homeassistant',
                'http://supervisor/core'
            ];
            if (
                this.nodeConfig.addon ||
                addonBaseUrls.includes(this.credentials.host)
            ) {
                this.credentials.host = 'http://supervisor/core';
                this.credentials.access_token = process.env.SUPERVISOR_TOKEN;

                this.RED.nodes.addCredentials(this.id, this.credentials);
            } else {
                this.nodeConfig.connectionDelay = false;
            }

            this.RED.httpAdmin.get(
                `/homeassistant/${this.id}/entities`,
                RED.auth.needsPermission('server.read'),
                httpHandlers.disableCache.bind(this),
                httpHandlers.getEntities.bind(this)
            );
            this.RED.httpAdmin.get(
                `/homeassistant/${this.id}/states`,
                RED.auth.needsPermission('server.read'),
                httpHandlers.disableCache.bind(this),
                httpHandlers.getStates.bind(this)
            );
            this.RED.httpAdmin.get(
                `/homeassistant/${this.id}/services`,
                RED.auth.needsPermission('server.read'),
                httpHandlers.disableCache.bind(this),
                httpHandlers.getServices.bind(this)
            );
            this.RED.httpAdmin.get(
                `/homeassistant/${this.id}/properties`,
                RED.auth.needsPermission('server.read'),
                httpHandlers.disableCache.bind(this),
                httpHandlers.getProperties.bind(this)
            );
            this.RED.httpAdmin.get(
                `/homeassistant/${this.id}/version`,
                RED.auth.needsPermission('server.read'),
                httpHandlers.getIntegrationVersion.bind(this)
            );

            this.setOnContext('states', []);
            this.setOnContext('services', []);
            this.setOnContext('isConnected', false);
            this.exposedNodes = [];

            if (this.credentials.host && !this.homeAssistant) {
                this.init();
            }
        }

        async init() {
            this.homeAssistant = new HomeAssistant({
                baseUrl: this.credentials.host,
                apiPass: this.credentials.access_token,
                legacy: this.nodeConfig.legacy,
                rejectUnauthorizedCerts: this.nodeConfig
                    .rejectUnauthorizedCerts,
                connectionDelay: this.nodeConfig.connectionDelay
            });
            this.http = this.homeAssistant.http;
            this.websocket = this.homeAssistant.websocket;

            this.websocket.addListener(
                'ha_client:close',
                this.onHaEventsClose.bind(this)
            );
            this.websocket.addListener(
                'ha_client:open',
                this.onHaEventsOpen.bind(this)
            );
            this.websocket.addListener(
                'ha_client:connecting',
                this.onHaEventsConnecting.bind(this)
            );
            this.websocket.addListener(
                'ha_client:error',
                this.onHaEventsError.bind(this)
            );
            this.websocket.addListener(
                'ha_client:states_loaded',
                this.onHaStatesLoaded.bind(this)
            );
            this.websocket.addListener(
                'ha_client:services_loaded',
                this.onHaServicesLoaded.bind(this)
            );
            this.websocket.once(
                'ha_client:connected',
                this.registerEvents.bind(this)
            );
            this.websocket.addListener(
                'ha_events:state_changed',
                this.onHaStateChanged.bind(this)
            );

            await this.homeAssistant.connect().catch(err => {
                this.websocket.connectionState = this.websocket.ERROR;
                this.websocket.emit('updateNodeStatus');
                this.node.error(err);
            });
        }

        get nameAsCamelcase() {
            return this.utils.toCamelCase(this.nodeConfig.name);
        }

        setOnContext(key, value) {
            let haCtx = this.context().global.get('homeassistant');
            haCtx = haCtx || {};
            haCtx[this.nameAsCamelcase] = haCtx[this.nameAsCamelcase] || {};
            haCtx[this.nameAsCamelcase][key] = value;
            this.context().global.set('homeassistant', haCtx);
        }

        getFromContext(key) {
            let haCtx = this.context().global.get('homeassistant');
            haCtx = haCtx || {};
            return haCtx[this.nameAsCamelcase]
                ? haCtx[this.nameAsCamelcase][key]
                : null;
        }

        onHaEventsOpen() {
            this.setOnContext('isConnected', true);

            this.log(`WebSocket Connected to ${this.credentials.host}`);
            this.debug('config server event listener connected');
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
        }

        onHaServicesLoaded(services) {
            this.setOnContext('services', services);
        }

        onHaEventsConnecting() {
            this.setOnContext('isConnected', false);
            this.log(`WebSocket Connecting ${this.credentials.host}`);
        }

        onHaEventsClose() {
            if (this.getFromContext('isConnected')) {
                this.log(`WebSocket Closed ${this.credentials.host}`);
            }
            this.setOnContext('isConnected', false);
        }

        onHaEventsError(err) {
            this.setOnContext('isConnected', false);
            this.debug(err);
        }

        // Close WebSocket client on redeploy or node-RED shutdown
        async onClose(removed) {
            super.onClose();
            const webSocketClient = this.utils.selectn(
                'homeAssistant.websocket.client',
                this
            );

            if (webSocketClient) {
                this.log(`Closing WebSocket ${this.credentials.host}`);
                webSocketClient.close();
            }
        }

        registerEvents() {
            this.homeAssistant.websocket.subscribeEvents(
                this.homeAssistant.eventsList
            );
        }
    }

    RED.nodes.registerType('server', ConfigServerNode, {
        credentials: {
            host: { type: 'text' },
            access_token: { type: 'text' }
        }
    });
};
