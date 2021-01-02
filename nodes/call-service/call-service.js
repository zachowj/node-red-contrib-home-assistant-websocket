/* eslint-disable camelcase */
const selectn = require('selectn');

const BaseNode = require('../../lib/base-node');
const RenderTemplate = require('../../lib/mustache-context');

const domainsNeedingArrays = [
    'homeassistant',
    'input_datetime',
    'input_number',
];

module.exports = function (RED) {
    const nodeOptions = {
        debug: true,
        config: {
            service_domain: {},
            service: {},
            entityId: {},
            data: {},
            dataType: (nodeDef) => nodeDef.dataType || 'json',
            mergecontext: {},
            name: {},
            server: { isNode: true },
            output_location: {},
            output_location_type: {},
            mustacheAltTags: {},
        },
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
            const config = this.nodeConfig;
            if (!this.isConnected) {
                this.setStatusFailed('No Connection');
                this.error(
                    'Call-Service attempted without connection to server.',
                    message
                );

                return;
            }

            let payload, payloadDomain, payloadService;

            if (message && message.payload) {
                payload = this.tryToObject(message.payload);
                payloadDomain = selectn('domain', payload);
                payloadService = selectn('service', payload);
            }
            const configDomain = config.service_domain;
            const configService = config.service;
            const context = this.node.context();
            const apiDomain = RenderTemplate(
                payloadDomain || configDomain,
                message,
                context,
                config.server.name
            );
            const apiService = RenderTemplate(
                payloadService || configService,
                message,
                context,
                config.server.name
            );
            let configData;
            if (config.dataType === 'jsonata' && config.data) {
                try {
                    configData = JSON.stringify(
                        this.evaluateJSONata(config.data, message)
                    );
                } catch (e) {
                    this.setStatusFailed('Error');
                    this.node.error(e.message, message);
                    return;
                }
            } else {
                configData = RenderTemplate(
                    config.data,
                    message,
                    context,
                    config.server.name,
                    config.mustacheAltTags
                );
            }

            const apiData = this.getApiData(payload, configData);

            if (!apiDomain || !apiService) {
                this.error(
                    `call service node is missing api "${
                        !apiDomain ? 'domain' : 'service'
                    }" property, not found in config or payload`,
                    message
                );
                this.setStatusFailed('Error');
                return;
            }

            this.debug(
                `Calling Service: ${apiDomain}:${apiService} -- ${JSON.stringify(
                    apiData || {}
                )}`
            );

            // Merge entity id field into data property if it doesn't exist
            if (
                config.entityId &&
                !Object.prototype.hasOwnProperty.call(apiData, 'entity_id')
            ) {
                const entityId = RenderTemplate(
                    config.entityId,
                    message,
                    context,
                    config.server.name,
                    config.mustacheAltTags
                );
                // homeassistant domain requires entity_id to be an array for multiple ids
                if (
                    domainsNeedingArrays.includes(apiDomain) &&
                    entityId.indexOf(',') !== -1
                ) {
                    apiData.entity_id = entityId
                        .split(',')
                        .map((e) => e.trim());
                } else {
                    apiData.entity_id = entityId;
                }
            }

            const msgPayload = {
                domain: apiDomain,
                service: apiService,
                data: apiData || null,
            };

            this.setStatusSending();

            this.debugToClient({
                domain: apiDomain,
                service: apiService,
                data: apiData,
            });

            return this.websocketClient
                .callService(apiDomain, apiService, apiData)
                .then(() => {
                    this.setStatusSuccess(`${apiDomain}.${apiService} called`);

                    this.setContextValue(
                        msgPayload,
                        config.output_location_type || 'msg',
                        config.output_location || 'payload',
                        message
                    );
                    this.send(message);
                })
                .catch((err) => {
                    this.error(
                        `Call-service API error. ${
                            err.message ? ` Error Message: ${err.message}` : ''
                        }`,
                        message
                    );
                    this.setStatusFailed('API Error');
                });
        }

        getApiData(payload, data) {
            let contextData = {};

            let payloadData = selectn('data', payload);
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
                contextData = { ...globalVal, ...flowVal };
            }

            return { ...configData, ...contextData, ...payloadData };
        }
    }

    RED.nodes.registerType('api-call-service', CallServiceNode);
};
