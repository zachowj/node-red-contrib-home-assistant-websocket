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

        debugger;
        if (node.url && !node.homeAssistant) {
            const ha    = node.homeAssistant = new HomeAssistant({ baseUrl: node.url, apiPass: node.pass });
            node.api    = ha.api;
            node.events = ha.events;
        }

        // All known entities derived from current state
        RED.httpAdmin.get('/homeassistant/entities', function (req, res, next) {
            res.end(JSON.stringify(Object.keys(node.homeAssistant.states)));
        });
        // The node-home-assistant module tracks state for us, just return the latest object
        RED.httpAdmin.get('/homeassistant/states', function (req, res, next) {
            res.end(JSON.stringify(node.homeAssistant.states));
        });
        // All known services available
        RED.httpAdmin.get('/homeassistant/services', function (req, res, next) {
            res.end(JSON.stringify(node.homeAssistant.availableServices));
        });
        // All known events that could be incoming
        RED.httpAdmin.get('/homeassistant/events', function (req, res, next) {
            res.end(JSON.stringify(node.homeAssistant.availableEvents));
        });
    }
    RED.nodes.registerType('server', ConfigServer);
}
