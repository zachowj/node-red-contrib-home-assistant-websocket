'use strict';
const debug    = require('debug')('home-assistant:service-call');
const isString = require('is-string');

const _int = {
    getSettings: function(config, node) {
        node.service_domain = config.service_domain;
        node.service        = config.service;
        let data = config.data || {};
        if (isString(config.data)) {
            try { data = JSON.parse(config.data); }
            catch (e) { debug('JSON parse error'); }
        }
        node.data = data;
        return node;
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
        const p = msg.payload;
        const domain  = p.domain || node.service_domain;
        const service = p.service || node.service;
        debugger;
        let data = p.data || {};
        if (isString(data)) {
            try { data = JSON.parse(p.data) }
            catch(e) { debug('JSON parse error'); }
        }
        data = Object.assign({}, node.data, data);

        if (!domain || !service) {
            node.warn('Domain or Service not set, skipping call service');
        } else {
            _int.flashStatus(node);
            debug(`Calling Service: ${domain}:${service} -- ${JSON.stringify(data)}`);
            node.server.api.callService(domain, service, data)
                .catch(err => {
                    node.warn('Error calling service, home assistant api error');
                    node.warn(err);
                    node.error(err);
                });
        }
    }
};


module.exports = function(RED) {
    function ServiceCall(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.server   = RED.nodes.getNode(config.server);
        _int.getSettings(config, node);

        node.on('input', (msg) => _int.onInput(msg, node));
    }

    RED.nodes.registerType('service-call', ServiceCall);
}
