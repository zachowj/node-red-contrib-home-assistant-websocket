'use strict';
const debug = require('debug')('home-assistant:service-call');

const _int = {
    getSettings: function(config) {
        return {
            domain:  config.servicedomain,
            service: config.service,
            data:    config.data
        };
    },
    flashStatus: function (node) {
        let status = false;
        const flash = setInterval(() => {
            const show = (status) ? { fill: 'blue', shape: 'dot' } : {};
            node.status(show);
            status = !status;
        }, 100);
        setTimeout(() => { clearInterval(flash); node.status({}); }, 1000);
    },
    onInput: function(msg, node) {
        const { domain, service, data } = Object.assign({}, node.settings, msg.payload);

        if (!domain || !service) {
            node.warn('Domain or Service not set, skipping call service');
        } else {
            _int.flashStatus(node);
            debug(`Calling Service: ${domain}:${service} -- ${JSON.stringify(data)}`);
            node.server.api.callService(domain, service, data)
                .then(res => node.send({ payload: { status: res.status, data: res.data } }))
                .catch(err => node.error(err));
        }
    }
};


module.exports = function(RED) {
    function ServiceCall(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.server   = RED.nodes.getNode(config.server);
        node.settings = _int.getSettings(config);

        node.on('input', (msg) => _int.onInput(msg, node));
    }

    RED.nodes.registerType('service-call', ServiceCall);
}
