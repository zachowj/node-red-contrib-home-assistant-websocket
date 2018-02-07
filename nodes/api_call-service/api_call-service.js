const Joi      = require('joi');
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
            return (v != null) && (typeof v == 'object'); // eslint-disable-line
        }
        // Disable connection status for api node
        setConnectionStatus() {}

        onInput({ message }) {
            let { service_domain, service, data } = this.nodeConfig;
            if (data && !this.isObjectLike(data)) {
                try {
                    data = JSON.parse(data);
                } catch (e) {}
            }

            const pDomain  = this.utils.reach('payload.domain', message);
            const pService = this.utils.reach('payload.service', message);
            const pData    = this.utils.reach('payload.data', message);


            // domain and service are strings, if they exist in payload overwrite any config value
            const apiDomain = pDomain || service_domain;
            const apiService = pService || service;
            if (!apiDomain) throw new Error('call service node is missing api "domain" property, not found in config or payload');
            if (!apiService) throw new Error('call service node is missing api "service" property, not found in config or payload');

            let apiData;
            // api data should be an object or falsey, if an object then attempt to merge with config value if also an object
            if (this.isObjectLike(pData)) {
                if (this.isObjectLike(data)) {
                    apiData = this.utils.merge({}, data, pData);
                } else {
                    apiData = pData;
                }
            // Not an object, but maybe "something"
            } else if (pData) {
                apiData = pData;
            } else {
                apiData = null;
            }

            apiData = (apiData && this.isObjectLike(apiData)) ? JSON.stringify(apiData) : null;
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
