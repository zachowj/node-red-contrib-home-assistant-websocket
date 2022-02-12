const selectn = require('selectn');

const EventsNode = require('../EventsNode');
const merge = require('lodash.merge');
const { generateRenderTemplate } = require('../../helpers/mustache');
const { HA_CLIENT_READY } = require('../../const');
const { isNodeRedEnvVar } = require('../../helpers/utils');

const QUEUE_NONE = 'none';
const QUEUE_FIRST = 'first';
const QUEUE_ALL = 'all';
const QUEUE_LAST = 'last';

const nodeOptions = {
    debug: true,
    config: {
        domain: {},
        service: {},
        target: {},
        data: {},
        dataType: (nodeDef) => nodeDef.dataType || 'json',
        mergeContext: {},
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

    onInput({ message, send, done }) {
        const config = this.nodeConfig;
        if (!this.isConnected && config.queue === QUEUE_NONE) {
            this.status.setFailed('No Connection');
            done('Call-Service attempted without connection to server.');

            return;
        }

        const context = this.node.context();
        const states = this.homeAssistant.getStates();

        const payloadDomain = selectn('payload.domain', message);
        const payloadService = selectn('payload.service', message);
        const payloadTarget = selectn('payload.target', message);
        const payloadData = selectn('payload.data', message);
        const render = generateRenderTemplate(message, context, states);
        const apiDomain = render(payloadDomain || config.domain);
        const apiService = render(payloadService || config.service);
        const apiTarget = this.getTargetData(payloadTarget, message);
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
            configData = render(config.data, config.mustacheAltTags);
        }
        const apiData = this.getApiData(payloadData, configData);

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
            `Calling Service: ${JSON.stringify({
                domain: apiDomain,
                service: apiService,
                target: apiTarget,
                data: apiData,
            })}`
        );

        const obj = {
            apiDomain,
            apiService,
            apiData: Object.keys(apiData).length ? apiData : undefined,
            apiTarget: Object.keys(apiTarget).length ? apiTarget : undefined,
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

    tryToObject(v) {
        if (!v) return null;
        try {
            return JSON.parse(v);
        } catch (e) {
            return v;
        }
    }

    getApiData(payload = {}, config = {}) {
        let contextData = {};

        // Calculate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
        if (this.nodeConfig.mergeContext) {
            const ctx = this.node.context();
            let flowVal = ctx.flow.get(this.nodeConfig.mergeContext);
            let globalVal = ctx.global.get(this.nodeConfig.mergeContext);
            flowVal = flowVal || {};
            globalVal = globalVal || {};
            contextData = { ...globalVal, ...flowVal };
        }

        return { ...this.tryToObject(config), ...contextData, ...payload };
    }

    getTargetData(payload, message) {
        const context = this.node.context();
        const states = this.homeAssistant.getStates();
        const render = generateRenderTemplate(message, context, states);

        const map = {
            areaId: 'area_id',
            deviceId: 'device_id',
            entityId: 'entity_id',
        };
        const configTarget = {};

        Object.keys(this.nodeConfig?.target).forEach((key) => {
            const prop = map[key];
            configTarget[prop] = this.nodeConfig.target[key]
                ? [...this.nodeConfig.target[key]]
                : undefined;
            if (Array.isArray(configTarget[prop])) {
                // If length is 0 set it to undefined so the target can be overridden from the data field
                if (configTarget[prop].length === 0) {
                    configTarget[prop] = undefined;
                } else {
                    configTarget[prop].forEach((target, index) => {
                        configTarget[prop][index] = isNodeRedEnvVar(target)
                            ? this.RED.util.evaluateNodeProperty(
                                  target,
                                  'env',
                                  this.node
                              )
                            : render(target);
                    });
                }
            } else if (configTarget[prop] !== undefined) {
                configTarget[prop] = [render(configTarget[prop])];
            }
        });
        // Convert possible comma delimited list to array
        configTarget.entity_id = configTarget.entity_id?.reduce(
            (acc, curr) =>
                acc.concat(
                    curr.indexOf(',')
                        ? curr.split(',').map((e) => e.trim())
                        : curr
                ),
            []
        );
        // If entity_id has a length of 1 convert it to a string
        if (configTarget.entity_id.length === 1) {
            configTarget.entity_id = configTarget.entity_id[0];
        }
        return merge(configTarget, payload);
    }

    async processInput({
        apiDomain,
        apiService,
        apiData,
        apiTarget,
        message,
        done,
        send,
    }) {
        this.status.setSending();

        const data = {
            domain: apiDomain,
            service: apiService,
            target: apiTarget,
            data: apiData,
        };
        this.debugToClient(data);

        try {
            await this.homeAssistant.callService(
                apiDomain,
                apiService,
                apiData,
                apiTarget
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
                data: data,
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
