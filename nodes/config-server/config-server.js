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

            if (this.nodeConfig.url && !this.homeAssistant) {
                this.homeAssistant = new HomeAssistant({ baseUrl: this.nodeConfig.url, apiPass: this.nodeConfig.pass }, { startListening: true });
                this.api    = this.homeAssistant.api;
                this.events = this.homeAssistant.events;

                // TODO: Run modify node-home-assistant to return error in testConnection()
                // then swap out for real connection test, set startListening above to false
                // const testConnection = () => Promise.resolve(true);
                // testConnection()
                //     .then(() => {
                //         this.events.startListening();
                //     })
                //     .catch(err => this.error(err));
            }

            this.RED.httpAdmin.get('/homeassistant/entities', httpHandlers.getEntities.bind(this));
            this.RED.httpAdmin.get('/homeassistant/states',   httpHandlers.getStates.bind(this));
            this.RED.httpAdmin.get('/homeassistant/services', httpHandlers.getServices.bind(this));
            this.RED.httpAdmin.get('/homeassistant/events',   httpHandlers.getEvents.bind(this));

            const HTTP_STATIC_OPTS = { root: require('path').join(__dirname, '..', '/_static'), dotfiles: 'deny' };
            this.RED.httpAdmin.get('/homeassistant/static/*', function(req, res) { res.sendFile(req.params[0], HTTP_STATIC_OPTS) });
        }
    }

    RED.nodes.registerType('server', ConfigServerNode);
};
