/* eslint-disable camelcase */
const selectn = require('selectn');

const EventsNode = require('./EventsNode');
const { HA_CLIENT_READY } = require('../const');
const { renderTemplate } = require('../helpers/renderTemplate');

const domainsNeedingArrays = [
    'homeassistant',
    'input_datetime',
    'input_number',
];
const QUEUE_NONE = 'none';
const QUEUE_FIRST = 'first';
const QUEUE_ALL = 'all';
const QUEUE_LAST = 'last';

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
        mustacheAltTags: {},
        outputProperties: {},
        queue: {},
    },
};

class CallService extends EventsNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });

        if (this.nodeConfig.queue !== QUEUE_NONE) {
            this.queue = [];
            this.addEventClientListener(
                HA_CLIENT_READY,
                this.onClientReady.bind(this)
            );
        }
    }

    isObjectLike(v) {
        return v !== null && typeof v === 'object';
    }

    tryToObject(v) {
        if (!v) return null;
        try {
            return JSON.parse(v);
        } catch (e) {
            return v;
        }
    }

    onInput({ message, parsedMessage, send, done }) {
        const config = this.nodeConfig;
        if (!this.isConnected && config.queue === QUEUE_NONE) {
            this.status.setFailed('No Connection');
            done('Call-Service attempted without connection to server.');

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
        const apiDomain = renderTemplate(
            payloadDomain || configDomain,
            message,
            context,
            this.homeAssistant.getStates()
        );
        const apiService = renderTemplate(
            payloadService || configService,
            message,
            context,
            this.homeAssistant.getStates()
        );
        let configData;
        if (config.dataType === 'jsonata' && config.data) {
            try {
                configData = JSON.stringify(
                    this.evaluateJSONata(config.data, { message })
                );
            } catch (e) {
                this.status.setFailed('Error');
                done(e.message);
                return;
            }
        } else {
            configData = renderTemplate(
                config.data,
                message,
                context,
                this.homeAssistant.getStates(),
                config.mustacheAltTags
            );
        }

        const apiData = this.getApiData(payload, configData);

        if (!apiDomain || !apiService) {
            done(
                `call service node is missing api "${
                    !apiDomain ? 'domain' : 'service'
                }" property, not found in config or payload`
            );
            this.status.setFailed('Error');
            return;
        }

        this.node.debug(
            `Calling Service: ${apiDomain}:${apiService} -- ${JSON.stringify(
                apiData || {}
            )}`
        );

        // Merge entity id field into data property if it doesn't exist
        if (
            config.entityId &&
            !Object.prototype.hasOwnProperty.call(apiData, 'entity_id')
        ) {
            const entityId = renderTemplate(
                config.entityId,
                message,
                context,
                this.homeAssistant.getStates(),
                config.mustacheAltTags
            );
            // homeassistant domain requires entity_id to be an array for multiple ids
            if (
                domainsNeedingArrays.includes(apiDomain) &&
                entityId.indexOf(',') !== -1
            ) {
                apiData.entity_id = entityId.split(',').map((e) => e.trim());
            } else {
                apiData.entity_id = entityId;
            }
        }

        const obj = {
            apiDomain,
            apiService,
            apiData,
            message,
            done,
            send,
        };

        if (!this.isConnected) {
            switch (this.nodeConfig.queue) {
                case QUEUE_FIRST:
                    if (this.queue.length === 0) {
                        this.queue = [obj];
                    }
                    break;
                case QUEUE_ALL:
                    this.queue.push(obj);
                    break;
                case QUEUE_LAST:
                    this.queue = [obj];
                    break;
            }
            this.status.setText(`${this.queue.length} queued`);
            return;
        }

        this.processInput(obj);
    }

    onClientReady() {
        while (this.queue.length) {
            this.processInput(this.queue.pop());
        }
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

    async processInput({
        apiDomain,
        apiService,
        apiData,
        message,
        done,
        send,
    }) {
        this.status.setSending();

        this.debugToClient({
            domain: apiDomain,
            service: apiService,
            data: apiData,
        });

        try {
            await this.homeAssistant.callService(
                apiDomain,
                apiService,
                apiData
            );
        } catch (err) {
            // ignore 'connection lost' error on homeassistant.restart
            if (
                apiDomain !== 'homeassistant' &&
                apiService !== 'restart' &&
                selectn('error.code', err) !== 3
            ) {
                done(`Call-service error. ${err.message ? err.message : ''}`);
                this.status.setFailed('API Error');
                return;
            }
        }

        this.status.setSuccess(`${apiDomain}.${apiService} called`);
        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                data: {
                    domain: apiDomain,
                    service: apiService,
                    data: apiData || null,
                },
            });
        } catch (e) {
            this.status.setFailed('error');
            done(e.message);
            return;
        }

        send(message);
        done();
    }
}

module.exports = CallService;
