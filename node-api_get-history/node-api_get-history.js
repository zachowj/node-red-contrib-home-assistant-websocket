'use strict';
const nodeUtils = require('../utils/node-utils');

const _int = {
    getSettings: function getSettings(config) {
        const settings = {
            startdate:    config.startdate,
            filterentity: config.filterentity
        };
        return settings;
    },
    /* eslint-disable consistent-return */
    onIncomingMessage: function onIncomingMessage(node, msg) {
        msg.startdate = (msg.startdate || node.settings.startdate) || new Date();
        msg.filterentity = msg.filterentity || node.settings.filterentity;

        // return node.server.api.getHistory(msg.startdate, msg.filterentity)
        // TODO: Implement filter entity like above
        return node.server.api.getHistory(msg.startdate)
            .then(res => {
                msg.payload = res;
                node.send(msg);
            })
            .catch(err => {
                console.log(err);
                let notifyError = 'Error calling service, home assistant api error'
                notifyError = (err && err.response)
                    ? notifyError += `: URL: ${err.response.config.url}, Status: ${err.response.status}, Message: ${err.message}`
                    : notifyError += `: ${err.message}`;

                node.error(notifyError, msg);
            });
    }
}

module.exports = function(RED) {
    function NodeApiGetHistory(config) {
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
    RED.nodes.registerType('api-get-history', NodeApiGetHistory);
};
