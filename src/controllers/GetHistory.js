const Joi = require('joi');
const timestring = require('timestring');

const BaseNode = require('./BaseNode');
const RenderTemplate = require('../helpers/mustache-context');

const nodeOptions = {
    debug: true,
    config: {
        name: {},
        server: { isNode: true },
        startdate: {},
        enddate: {},
        entityid: (nodeDef) => (nodeDef.entityid || '').trim(),
        entityidtype: {},
        useRelativeTime: {},
        relativeTime: {},
        flatten: {},
        output_type: {},
        output_location_type: {},
        output_location: {},
    },
    input: {
        startDate: {
            messageProp: ['payload.startdate', 'startdate'],
            configProp: 'startdate',
            default: () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toISOString();
            },
            validation: {
                schema: Joi.date().optional().allow('').label('startdate'),
            },
        },
        endDate: {
            messageProp: ['payload.enddate', 'enddate'],
            configProp: 'enddate',
            validation: {
                schema: Joi.date().optional().allow('').label('enddate'),
            },
        },
        entityId: {
            messageProp: ['payload.entity_id', 'entityid'],
            configProp: 'entityid',
        },
        entityIdType: {
            messageProp: ['payload.entityidtype', 'entityidtype'],
            configProp: 'entityidtype',
        },
        relativeTime: {
            messageProp: ['payload.relativetime', 'relativetime'],
            configProp: 'relativeTime',
        },
        flatten: {
            messageProp: ['payload.flatten', 'flatten'],
            configProp: 'flatten',
        },
    },
};

class GetHistory extends BaseNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });
    }

    async onInput({ parsedMessage, message, send, done }) {
        if (!this.homeAssistant) {
            this.status.setFailed('No server');
            done('No valid Home Assistant server selected.');
            return;
        }

        let {
            startDate,
            endDate,
            entityId,
            entityIdType,
            relativeTime,
            flatten,
        } = parsedMessage;
        startDate = startDate.value;
        endDate = endDate.value;
        entityId =
            parsedMessage.entityId.source === 'message'
                ? entityId.value
                : RenderTemplate(
                      entityId.value,
                      message,
                      this.node.context(),
                      this.nodeConfig.server.name
                  );
        relativeTime = relativeTime.value;
        flatten = flatten.value;
        const useRelativeTime = this.nodeConfig.useRelativeTime;

        if (
            useRelativeTime ||
            parsedMessage.relativeTime.source === 'message'
        ) {
            startDate = new Date(
                Date.now() - timestring(relativeTime, 'ms')
            ).toISOString();
            endDate = new Date().toISOString();
        }

        const apiRequest =
            entityIdType.value === 'includes' && entityId
                ? this.homeAssistant.getHistory(startDate, null, endDate, {
                      flatten: flatten,
                      include: new RegExp(entityId),
                  })
                : this.homeAssistant.getHistory(startDate, entityId, endDate, {
                      flatten: flatten,
                  });

        this.status.setSending('Requesting');

        let results;
        try {
            results = await apiRequest;
            message.startdate = startDate;
            message.enddate = endDate || null;
            message.entity_id = entityId || null;
        } catch (err) {
            this.status.setFailed('Error');
            done(`Error get-history: ${err.message}`);
            return;
        }

        switch (this.nodeConfig.output_type) {
            case 'split':
                if (results.length === 0) {
                    this.status.setFailed('No Results');
                    return;
                }
                if (entityIdType.value === 'is' && !flatten) {
                    results = results[0];
                }

                this.sendSplit(message, results, send);
                break;

            case 'array':
            default:
                this.setContextValue(
                    results,
                    this.nodeConfig.output_location_type,
                    this.nodeConfig.output_location,
                    message
                );

                send(message);
                break;
        }

        this.status.setSuccess();
        done();
    }
}

module.exports = GetHistory;
