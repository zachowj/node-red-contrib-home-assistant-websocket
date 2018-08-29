/* eslint-disable camelcase */
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            service_domain: {},
            service:        {},
            data:           {},
            mergecontext:   {},
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
            let payload, payloadDomain, payloadService;

            if (message && message.payload) {
                payload  = this.tryToObject(message.payload);
                payloadDomain  = this.utils.reach('domain',  payload);
                payloadService = this.utils.reach('service', payload);
            }
            const configDomain  = this.nodeConfig.service_domain;
            const configService = this.nodeConfig.service;

            const apiDomain  = payloadDomain  || configDomain;
            const apiService = payloadService || configService;
            const apiData    = this.getApiData(payload);
            if (!apiDomain)  throw new Error('call service node is missing api "domain" property, not found in config or payload');
            if (!apiService) throw new Error('call service node is missing api "service" property, not found in config or payload');

            this.debug(`Calling Service: ${apiDomain}:${apiService} -- ${JSON.stringify(apiData || {})}`);
            var prettyDate = new Date().toLocaleDateString("en-US",{month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric'});
            this.status({fill:"green",shape:"dot",text:`${apiDomain}.${apiService} called at: ${prettyDate}`});

            message.payload =  {
                domain:  apiDomain,
                service: apiService,
                data:    apiData || null
            };
            this.send(message);

            return this.nodeConfig.server.api.callService(apiDomain, apiService, apiData)
                .catch(err => {
                    this.warn('Error calling service, home assistant api error', err);
                    this.error('Error calling service, home assistant api error', message);
                    this.status({fill:"red",shape:"ring",text:`API Error at: ${prettyDate}`});
                });
        }

        getApiData(payload) {
            let apiData;
            let contextData = {};

            let payloadData = this.utils.reach('data', payload);
            let configData  = this.tryToObject(this.nodeConfig.data);
            payloadData = payloadData || {};
            configData  = configData || {};

            // Cacluate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
            if (this.nodeConfig.mergecontext) {
                const ctx     = this.node.context();
                let flowVal   = ctx.flow.get(this.nodeConfig.mergecontext);
                let globalVal = ctx.global.get(this.nodeConfig.mergecontext);
                flowVal       = flowVal || {};
                globalVal     = globalVal || {};
                contextData   = this.utils.merge({}, globalVal, flowVal);
            }

            apiData = this.utils.merge({}, configData, contextData, payloadData);
            return apiData;
        }
    }

    RED.nodes.registerType('api-call-service', CallServiceNode);
};
