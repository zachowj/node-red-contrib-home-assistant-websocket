const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const HomeAssistant = require('node-home-assistant');

    const httpHandlers = {
        getEntities: function (req, res, next) {
            return this.api.getStates()
                .then(states => res.json(JSON.stringify(Object.keys(states))))
                .catch(e => this.error(e.message));
        },
        getStates: function (req, res, next) {
            return this.homeAssistant.getStates()
                .then(states => res.json(JSON.stringify(states)))
                .catch(e => this.error(e.message));
        },
        getServices: function (req, res, next) {
            return this.homeAssistant.getServices()
                .then(services => res.json(JSON.stringify(services)))
                .catch(e => this.error(e.message));
        },
        getEvents: function (req, res, next) {
            return this.homeAssistant.getEvents()
                .then(events => res.json(JSON.stringify(events)))
                .catch(e => this.error(e.message));
        }
    };

    const nodeOptions = {
        debug:  true,
        config: {
            name: {},
            url:  {},
            pass: {}
        }
    };

    class ConfigServerNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            this.RED.httpAdmin.get('/homeassistant/entities', httpHandlers.getEntities.bind(this));
            this.RED.httpAdmin.get('/homeassistant/states',   httpHandlers.getStates.bind(this));
            this.RED.httpAdmin.get('/homeassistant/services', httpHandlers.getServices.bind(this));
            this.RED.httpAdmin.get('/homeassistant/events',   httpHandlers.getEvents.bind(this));

            const HTTP_STATIC_OPTS = { root: require('path').join(__dirname, '..', '/_static'), dotfiles: 'deny' };
            this.RED.httpAdmin.get('/homeassistant/static/*', function(req, res) { res.sendFile(req.params[0], HTTP_STATIC_OPTS) });

            if (this.nodeConfig.url && !this.homeAssistant) {
                this.homeAssistant = new HomeAssistant({ baseUrl: this.nodeConfig.url, apiPass: this.nodeConfig.pass }, { startListening: false });
                this.api    = this.homeAssistant.api;
                this.events = this.homeAssistant.events;

                this.events.addListener('ha_events:close', this.onHaEventsClose.bind(this));
                this.events.addListener('ha_events:open',  this.onHaEventsOpen.bind(this));
                this.events.addListener('ha_events:error', this.onHaEventsError.bind(this));

                this.homeAssistant.startListening()
                    .catch(() => this.startListening());
            }
        }

        // This simply tries to connected every 2 seconds, after the initial connection is successful
        // reconnection attempts are handled by node-home-assistant.  This could use some love obviously
        startListening() {
            if (this.connectionAttempts) {
                clearInterval(this.connectionAttempts);
                this.connectionAttempts = null;
            }

            this.connectionAttempts = setInterval(() => {
                this.homeAssistant.startListening()
                    .then(() => {
                        this.debug('Connected to home assistant');
                        clearInterval(this.connectionAttempts);
                        this.connectionAttempts = null;
                    })
                    .catch(err => this.error(`Home assistant connection failed with error: ${err.message}`));
            }, 2000);
        }

        onHaEventsOpen() {
            // This is another hack that should be set in node-home-assistant
            // when the connection is first made the states cache needs to be refreshed
            this.api.getStates(null, { forceRefresh: true });
            this.api.getServices({ forceRefresh: true });
            this.api.getEvents({ forceRefresh: true });
            this.debug('config server event listener connected');
        }

        onHaEventsClose() {
            this.debug('config server event listener closed');
        }

        onHaEventsError(err) {
            this.debug(err);
        }
    }

    RED.nodes.registerType('server', ConfigServerNode);
};
