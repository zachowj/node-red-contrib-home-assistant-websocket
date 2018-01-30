'use strict';

module.exports = function(RED) {
    const HomeAssistant = require('node-home-assistant');

    /* ********************************************************************* */
    /*                  Node Definition                                      */
    /* ********************************************************************* */
    function ConfigServer(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        // TODO: Change the parameters above to use credentials instead of defaults options
        // http://nodered.org/docs/creating-nodes/credentials
        node.name = config.name;
        node.url = config.url;
        node.pass = config.pass;

        if (node.url && !node.homeAssistant) {
            const ha    = node.homeAssistant = new HomeAssistant({ baseUrl: node.url, apiPass: node.pass });
            node.api    = ha.api;
            node.events = ha.events;
        }

        // All known entities derived from current state
        RED.httpAdmin.get('/homeassistant/entities', function (req, res, next) {
            return node.homeAssistant.getStates()
                .then(states => {
                    const entities = JSON.stringify(Object.keys(states));
                    return res.end(entities);
                })
                .catch(err => node.debug(err));
        });
        // The node-home-assistant module tracks state for us, just return the latest object
        RED.httpAdmin.get('/homeassistant/states', function (req, res, next) {
            return node.homeAssistant.getStates()
                .then(states => {
                    const resStates = JSON.stringify(states);
                    return res.end(resStates);
                })
                .catch(err => node.debug(err));
        });
        // All known services available
        RED.httpAdmin.get('/homeassistant/services', function (req, res, next) {
            return node.homeAssistant.getServices()
                .then(services => {
                    const resServices = JSON.stringify(services);
                    return res.end(resServices);
                })
                .catch(err => node.debug(err));
        });
        // All known events that could be incoming
        RED.httpAdmin.get('/homeassistant/events', function (req, res, next) {
            return node.homeAssistant.getEvents()
                .then(events => {
                    const resEvents = JSON.stringify(events);
                    return res.end(resEvents);
                })
                .catch(err => node.debug(err));
        });

        const HTTP_STATIC_OPTS = { root: require('path').join(__dirname, '..', '/_static'), dotfiles: 'deny' };
        RED.httpAdmin.get('/homeassistant/static/*', function(req, res) {
            res.sendFile(req.params[0], HTTP_STATIC_OPTS);
        });
    }
    RED.nodes.registerType('server', ConfigServer);
};
