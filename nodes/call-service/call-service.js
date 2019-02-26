/* eslint-disable camelcase */
const BaseNode = require('../../lib/base-node');
// const mustache = require('mustache');
const RenderTemplate = require('../../lib/mustache-context');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            service_domain: {},
            service: {},
            data: {},
            mergecontext: {},
            name: {},
            server: { isNode: true },
            output_location: {},
            output_location_type: {}
        }
    };

    class CallServiceNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }
        isObjectLike(v) {
            return v !== null && typeof v === 'object';
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
            if (
                this.nodeConfig.server.websocket.connectionState !==
                this.nodeConfig.server.websocket.CONNECTED
            ) {
                this.status({
                    fill: 'red',
                    shape: 'ring',
                    text: `No Connection at: ${this.getPrettyDate()}`
                });
                this.warn(
                    'Call-Service attempted without connection to server.'
                );

                return;
            }

            let payload, payloadDomain, payloadService;

            if (message && message.payload) {
                payload = this.tryToObject(message.payload);
                payloadDomain = this.utils.reach('domain', payload);
                payloadService = this.utils.reach('service', payload);
            }

            const configDomain = this.nodeConfig.service_domain;
            const configService = this.nodeConfig.service;
            const apiDomain = payloadDomain || configDomain;
            const apiService = payloadService || configService;
            const configData = RenderTemplate(
                this.nodeConfig.data,
                message,
                this.node.context(),
                this.utils.toCamelCase(this.nodeConfig.server.name)
            );
            const apiData = this.getApiData(payload, configData);

            if (!apiDomain) {
                throw new Error(
                    'call service node is missing api "domain" property, not found in config or payload'
                );
            }

            if (!apiService) {
                throw new Error(
                    'call service node is missing api "service" property, not found in config or payload'
                );
            }

            this.debug(
                `Calling Service: ${apiDomain}:${apiService} -- ${JSON.stringify(
                    apiData || {}
                )}`
            );

            const msgPayload = {
                domain: apiDomain,
                service: apiService,
                data: apiData || null
            };

            this.status({
                fill: 'yellow',
                shape: 'dot',
                text: `Sending at: ${this.getPrettyDate()}`
            });

            return this.nodeConfig.server.websocket
                .callService(apiDomain, apiService, apiData)
                .then(() => {
                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `${apiDomain}.${apiService} called at: ${this.getPrettyDate()}`
                    });

                    const contextKey = RED.util.parseContextStore(
                        this.nodeConfig.output_location
                    );
                    contextKey.key = contextKey.key || 'payload';
                    const locationType =
                        this.nodeConfig.output_location_type || 'msg';

                    if (locationType === 'flow' || locationType === 'global') {
                        this.node
                            .context()
                            [locationType].set(
                                contextKey.key,
                                msgPayload,
                                contextKey.store
                            );
                    } else if (locationType === 'msg') {
                        message[contextKey.key] = msgPayload;
                    }

                    this.send(message);
                })
                .catch(err => {
                    let errorMessage =
                        'Error call service, home assistant api error.';
                    if (err.message)
                        errorMessage = `${errorMessage} Error Message: ${
                            err.message
                        }`;
                    this.error(errorMessage);

                    this.status({
                        fill: 'red',
                        shape: 'ring',
                        text: `API Error at: ${this.getPrettyDate()}`
                    });
                });
        }

        getApiData(payload, data) {
            let apiData;
            let contextData = {};

            let payloadData = this.utils.reach('data', payload);
            let configData = this.tryToObject(data);
            payloadData = payloadData || {};
            configData = configData || {};

            // Calculate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
            if (this.nodeConfig.mergecontext) {
                const ctx = this.node.context();
                let flowVal = ctx.flow.get(this.nodeConfig.mergecontext);
                let globalVal = ctx.global.get(this.nodeConfig.mergecontext);
                flowVal = flowVal || {};
                globalVal = globalVal || {};
                contextData = this.utils.merge({}, globalVal, flowVal);
            }

            apiData = this.utils.merge(
                {},
                configData,
                contextData,
                payloadData
            );

            return apiData;
        }
    }

    RED.nodes.registerType('api-call-service', CallServiceNode);
};
