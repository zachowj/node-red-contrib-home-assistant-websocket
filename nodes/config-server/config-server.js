const bonjour = require('bonjour')();
const flatten = require('flat');
const merge = require('lodash.merge');
const uniq = require('lodash.uniq');

const createHomeAssistantClient = require('../../lib/HomeAssistant');
const { INTEGRATION_NOT_LOADED } = require('../../lib/const');
const { toCamelCase } = require('../../lib/utils');

module.exports = function (RED) {
    const httpHandlers = {
        disableCache: function (req, res, next) {
            if (this.config.cacheJson === false) {
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
        getEntities: function (req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            const states = this.homeAssistant.getEntities();
            res.json(states);
        },
        getStates: function (req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            const states = this.homeAssistant.getStates();
            res.json(states);
        },
        getServices: function (req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            const services = this.homeAssistant.getServices();
            res.json(services);
        },
        getProperties: function (req, res, next) {
            if (!this.homeAssistant) {
                return res.json([]);
            }

            let flat = [];
            let singleEntity = !!req.query.entityId;

            let states = this.homeAssistant.getStates(req.query.entityId);

            if (!states) {
                states = this.homeAssistant.getStates();
                singleEntity = false;
            }

            if (singleEntity) {
                flat = Object.keys(flatten(states)).filter(
                    (e) => e.indexOf(req.query.term) !== -1
                );
            } else {
                flat = Object.values(states).map((entity) =>
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
        getIntegrationVersion: function (req, res, next) {
            const client = this.homeAssistant;
            const data = { version: client ? client.integrationVersion : 0 };

            res.json(data);
        },
    };

    RED.httpAdmin.get('/homeassistant/discover', function (req, res) {
        const instances = [];
        bonjour.find({ type: 'home-assistant' }, (service) => {
            instances.push({
                label: service.name
                    ? `${service.name} (${service.txt.base_url})`
                    : service.txt.base_url,
                value: service.txt.base_url,
            });
        });

        // Add a bit of delay for all services to be discovered
        setTimeout(() => {
            res.json(instances);
        }, 3000);
    });

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

    class ConfigServerNode {
        constructor(nodeDefinition) {
            RED.nodes.createNode(this, nodeDefinition);
            this.node = this;

            this.RED = RED;
            this.config = merge({}, nodeDefaults, nodeDefinition);

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
                'http://supervisor/core',
            ];
            if (
                this.config.addon ||
                addonBaseUrls.includes(this.credentials.host)
            ) {
                this.credentials.host = 'http://supervisor/core';
                this.credentials.access_token = process.env.SUPERVISOR_TOKEN;

                this.RED.nodes.addCredentials(this.id, this.credentials);
            } else {
                this.config.connectionDelay = false;
            }

            const endpoints = {
                entities: httpHandlers.getEntities,
                states: httpHandlers.getStates,
                services: httpHandlers.getServices,
                properties: httpHandlers.getProperties,
            };
            Object.entries(endpoints).forEach(([key, value]) =>
                this.RED.httpAdmin.get(
                    `/homeassistant/${this.id}/${key}`,
                    RED.auth.needsPermission('server.read'),
                    httpHandlers.disableCache.bind(this),
                    value.bind(this)
                )
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

            this.node.on('close', this.onClose.bind(this));
        }

        async init() {
            try {
                this.homeAssistant = createHomeAssistantClient(
                    this.config,
                    this.credentials
                );

                this.startListeners();

                await this.homeAssistant.connect();
            } catch (e) {
                this.node.error(
                    RED._(e.message, { base_url: this.credentials.host })
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

            this.log(`Connected to ${this.credentials.host}`);
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
            this.debug('States Loaded');
        }

        onHaServicesLoaded(services) {
            this.setOnContext('services', services);
            this.debug('Services Loaded');
        }

        onHaEventsConnecting() {
            this.setOnContext('isConnected', false);
            this.setOnContext('isRunning', false);
            this.log(`Connecting to ${this.credentials.host}`);
        }

        onHaEventsClose() {
            if (this.getFromContext('isConnected')) {
                this.log(`Connection closed to ${this.credentials.host}`);
            }
            this.setOnContext('isConnected', false);
            this.setOnContext('isRunning', false);
        }

        onHaEventsRunning() {
            this.setOnContext('isRunning', true);
            this.debug(`HA State: running`);
        }

        onHaEventsError(err) {
            this.setOnContext('isConnected', false);
            this.setOnContext('isRunning', false);
            this.debug(err);
        }

        // Close WebSocket client on redeploy or node-RED shutdown
        onClose(removed, done) {
            if (this.HomeAssistant) {
                this.log(`Closing connection to ${this.credentials.host}`);
                this.HomeAssistant.close();
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
            this.debug(`Integration: ${eventType}`);
        }

        registerEvents() {
            this.homeAssistant.subscribeEvents();
        }
    }

    RED.nodes.registerType('server', ConfigServerNode, {
        credentials: {
            host: { type: 'text' },
            access_token: { type: 'text' },
        },
    });
};
