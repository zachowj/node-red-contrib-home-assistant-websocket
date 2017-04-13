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
        node.settings = {
            baseUrl: config.url,
            apiPass: config.pass
        };

        if (node.settings.baseUrl) {
            const ha    = node.homeAssistant = new HomeAssistant(node.settings);
            node.api    = ha.api;
            node.events = ha.events;

            node.currentStates     = ha.states;
            node.availableServices = ha.availableServices;
            node.availableEvents   = ha.availableEvents;
        }


    }
    RED.nodes.registerType('server', ConfigServer);
}
