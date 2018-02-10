/* eslint-disable camelcase */
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            service_domain: {},
            service:        {},
            data:           {},
            name:           {},
            server:         { isNode: true }
        }
    };

    class CallServiceNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }
        isObjectLike (v) {
            return (v !== null) && (typeof v === 'object');
        }
        // Disable connection status for api node
        setConnectionStatus() {}
        tryToObject(v) {
            if (!v) return null;
            try {
                return JSON.parse(v);
            } catch (e) {
                return v;
            }
        }
        onInput({ message }) {
            let payloadDomain, payloadService, payloadData;

            if (message && message.payload) {
                const payload  = this.tryToObject(message.payload);
                payloadDomain  = this.utils.reach('domain',  payload);
                payloadService = this.utils.reach('service', payload);
                payloadData    = this.utils.reach('data',    payload);
            }
            const configDomain  = this.nodeConfig.service_domain;
            const configService = this.nodeConfig.service;
            let   configData    = this.nodeConfig.data;
            configData = this.tryToObject(configData);

            const apiDomain  = payloadDomain  || configDomain;
            const apiService = payloadService || configService;
            if (!apiDomain)  throw new Error('call service node is missing api "domain" property, not found in config or payload');
            if (!apiService) throw new Error('call service node is missing api "service" property, not found in config or payload');

            // api data should be an object or falsey, if an object then attempt to merge with config value if also an object
            let apiData;

            const payloadDataIsObject = this.isObjectLike(payloadData);
            const configDataIsObject  = this.isObjectLike(configData);

            if (payloadDataIsObject && configDataIsObject) {
                apiData = JSON.stringify(this.utils.merge({}, configData, payloadData));
            } else if (payloadDataIsObject) {
                apiData = JSON.stringify(payloadData);
            } else if (configDataIsObject) {
                apiData = JSON.stringify(configData);
            }

            this.debugToClient(`Calling Service: ${apiDomain}:${apiService} -- ${apiData}`);

            return this.nodeConfig.server.api.callService(apiDomain, apiService, apiData)
                .catch(err => {
                    this.warn('Error calling service, home assistant api error', err);
                    this.error('Error calling service, home assistant api error', message);
                });
        }
    }

    RED.nodes.registerType('api-call-service', CallServiceNode);
};
