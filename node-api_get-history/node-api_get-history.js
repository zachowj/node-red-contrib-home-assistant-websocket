/* eslint-disable consistent-return */
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

    onIncomingMessage: function onIncomingMessage(node, msg) {
        msg.startdate    = msg.startdate    || node.settings.startdate;
        // TODO: Add support after upgrading node-home-assistant lib
        // msg.filterentity = msg.filterentity || node.settings.filterentity;

        if (!msg.startdate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            msg.startdate = yesterday.toISOString();
        }

        // TODO: See above
        const request = node.server.api.getHistory(msg.startdate);
        // const request = (msg.filterentity)
        //     ? node.server.api.getHistory(msg.startdate)
        //     : node.server.api.getHistory(msg.startdate, msg.filterentity)

        return request
            .then(res => {
                msg.payload = res;
                node.send(msg);
            })
            .catch(err => {
                console.log(err); // eslint-disable-line
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
