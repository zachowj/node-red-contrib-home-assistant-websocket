'use strict';
const isString = require('is-string');
const nodeUtils = require('../utils/node-utils');

const _int = {
    getSettings: function(config, node) {
        node.service_domain = config.service_domain;
        node.service        = config.service;
        let data = config.data || {};
        if (isString(config.data)) {
            try { data = JSON.parse(config.data); }
            catch (e) {
                node.error('JSON parse error in settings parser');
            }
        }
        node.data = data;
        return node;
    },
    onInput: function(msg, node) {
        const p = msg.payload;
        const domain  = p.domain || node.service_domain;
        const service = p.service || node.service;

        let data = p.data || {};

        if (isString(data)) {
            try { data = JSON.parse(data) }
            catch (e) {
                node.error('JSON parse error during input', msg);
            }
        }

        data = Object.assign({}, node.data, data);

        if (!domain || !service) {
            node.warn('Domain or Service not set, skipping call service');
        } else {
            let dataStr = '';
            try {
                dataStr = JSON.stringify(data);
            } catch(e) { node.debug('JSON stringify error'); }

            nodeUtils.flashAttentionStatus(node, { appendMsg: dataStr });
            node.debug(`Calling Service: ${domain}:${service} -- ${dataStr}`);

            node.server.api.callService(domain, service, data)
                .catch(err => {
                    node.warn('Error calling service, home assistant api error');
                    node.error('Error calling service, home assistant api error', msg);
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
        node.status({});

        node.on('input', (msg) => _int.onInput(msg, node));
    }

    RED.nodes.registerType('service-call', ServiceCall);
}
