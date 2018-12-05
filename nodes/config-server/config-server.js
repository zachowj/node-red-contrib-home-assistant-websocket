const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const HomeAssistant = require('../../lib/node-home-assistant');

    const httpHandlers = {
        getEntities: function(req, res, next) {
            return this.homeAssistant
                .getEntities()
                .then(states => res.json(JSON.stringify(states)))
                .catch(e => this.error(e.message));
        },
        getStates: function(req, res, next) {
            return this.homeAssistant
                .getStates()
                .then(states => res.json(JSON.stringify(states)))
                .catch(e => this.error(e.message));
        },
        getServices: function(req, res, next) {
            return this.homeAssistant
                .getServices()
                .then(services => res.json(JSON.stringify(services)))
                .catch(e => this.error(e.message));
        }
    };

    const nodeOptions = {
        debug: true,
        config: {
            name: {},
            legacy: {},
            hassio: {},
            rejectUnauthorizedCerts: {},
            ha_boolean: {}
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
            // Check if using Hass.io URL and import proxy token
            if (this.credentials.host === 'http://hassio/homeassistant') {
                this.credentials.access_token = process.env.HASSIO_TOKEN;

                this.RED.nodes.addCredentials(this.id, this.credentials);
            }

            this.RED.httpAdmin.get(
                '/homeassistant/entities',
                RED.auth.needsPermission('server.read'),
                httpHandlers.getEntities.bind(this)
            );
            this.RED.httpAdmin.get(
                '/homeassistant/states',
                RED.auth.needsPermission('server.read'),
                httpHandlers.getStates.bind(this)
            );
            this.RED.httpAdmin.get(
                '/homeassistant/services',
                RED.auth.needsPermission('server.read'),
                httpHandlers.getServices.bind(this)
            );

            const HTTP_STATIC_OPTS = {
                root: require('path').join(__dirname, '..', '/_static'),
                dotfiles: 'deny'
            };
            this.RED.httpAdmin.get(
                '/homeassistant/static/*',
                RED.auth.needsPermission('server.read'),
                function(req, res) {
                    res.sendFile(req.params[0], HTTP_STATIC_OPTS);
                }
            );

            this.setOnContext('states', []);
            this.setOnContext('services', []);
            this.setOnContext('isConnected', false);

            if (this.credentials.host && !this.homeAssistant) {
                this.homeAssistant = new HomeAssistant({
                    baseUrl: this.credentials.host,
                    apiPass: this.credentials.access_token,
                    legacy: this.nodeConfig.legacy,
                    rejectUnauthorizedCerts: this.nodeConfig
                        .rejectUnauthorizedCerts
                });
                this.api = this.homeAssistant.api;
                this.websocket = this.homeAssistant.websocket;

                this.homeAssistant
                    .startListening()
                    // .then(this.onHaEventsOpen())
                    .catch(err => this.node.error(err));

                this.websocket.addListener(
                    'ha_events:close',
                    this.onHaEventsClose.bind(this)
                );
                this.websocket.addListener(
                    'ha_events:open',
                    this.onHaEventsOpen.bind(this)
                );
                this.websocket.addListener(
                    'ha_events:connecting',
                    this.onHaEventsConnecting.bind(this)
                );
                this.websocket.addListener(
                    'ha_events:error',
                    this.onHaEventsError.bind(this)
                );
                this.websocket.addListener(
                    'ha_events:state_changed',
                    this.onHaStateChanged.bind(this)
                );
                this.websocket.addListener(
                    'ha_events:states_loaded',
                    this.onHaStatesLoaded.bind(this)
                );
                this.websocket.addListener(
                    'ha_events:services_loaded',
                    this.onHaServicesLoaded.bind(this)
                );
            }
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
            this.debug(`WebSocket Connecting ${this.credentials.host}`);
            this.debug('config server event listener connecting');
        }

        onHaEventsClose() {
            if (this.getFromContext('isConnected')) {
                this.log(`WebSocket Closed ${this.credentials.host}`);
            }
            this.setOnContext('isConnected', false);
            this.debug('config server event listener closed');
        }

        onHaEventsError(err) {
            this.setOnContext('isConnected', false);
            this.debug(err);
        }

        // Close WebSocket client on redeploy or node-RED shutdown
        async onClose(removed) {
            super.onClose();
            const webSocketClient = this.utils.reach(
                'homeAssistant.websocket.client',
                this
            );

            if (webSocketClient) {
                this.log(`Closing WebSocket ${this.credentials.host}`);
                webSocketClient.close();
            }
        }
    }

    RED.nodes.registerType('server', ConfigServerNode, {
        credentials: {
            host: { type: 'text' },
            access_token: { type: 'text' }
        }
    });
};
