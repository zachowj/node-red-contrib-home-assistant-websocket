'use strict';
const nodeUtils = require('../../utils/node-utils');

const _int = {
    getSettings: function getSettings(config) {
        const settings = {
            template: config.template
        };
        return settings;
    },
    /* eslint-disable consistent-return */
    onIncomingMessage: function onIncomingMessage(node, msg) {
        msg.template = msg.template || node.settings.template;
        if (!msg.template) { node.warn('No template configured or passed in `msg.template`, skipping render call'); return node.send(msg) }

        return node.server.api.renderTemplate(msg.template)
            .then(res => {
                msg.payload = res;
                node.send(msg);
            })
            .catch(err => {
                console.log(err);
                node.error('Error calling service, home assistant api error', msg);
            });
    }
};

module.exports = function(RED) {
    function EventsStateChange(config) {
        const node = this;
        RED.nodes.createNode(node, config);
        node.status({});

        node.settings = _int.getSettings(config);
        node.server = RED.nodes.getNode(config.server);

        // If the event source was setup start listening for events
        if (node.server) {
            node.on('input', (msg) => _int.onIncomingMessage(node, msg));
        } else {
            nodeUtils.setConnectionStatus(node, false);
        }
    }
    RED.nodes.registerType('api-render-template', EventsStateChange);
};
