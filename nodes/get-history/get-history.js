const Joi = require('joi');
const timestring = require('timestring');

const BaseNode = require('../../lib/base-node');
const RenderTemplate = require('../../lib/mustache-context');

module.exports = function (RED) {
    const nodeOptions = {
        debug: true,
        config: {
            name: {},
            server: { isNode: true },
            startdate: {},
            enddate: {},
            entityid: {},
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

    class GetHistoryNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        async onInput({ parsedMessage, message }) {
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

            if (this.nodeConfig.server === null) {
                this.node.error('No valid server selected.', message);
                return;
            }

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
                    ? this.httpClient.getHistory(startDate, null, endDate, {
                          flatten: flatten,
                          include: new RegExp(entityId),
                      })
                    : this.httpClient.getHistory(startDate, entityId, endDate, {
                          flatten: flatten,
                      });

            this.setStatusSending('Requesting');

            let results;
            try {
                results = await apiRequest;
                message.startdate = startDate;
                message.enddate = endDate || null;
                message.entity_id = entityId || null;
            } catch (err) {
                this.error(`Error get-history: ${err.message}`, message);
                this.setStatusFailed('Error');

                return;
            }

            if (this.nodeConfig.output_location === undefined) {
                this.nodeConfig.output_location = 'payload';
                this.nodeConfig.output_location_type = 'msg';
            }

            switch (this.nodeConfig.output_type) {
                case 'split':
                    if (results.length === 0) {
                        this.setStatusFailed('No Results');
                        return;
                    }
                    if (entityIdType.value === 'is' && !flatten) {
                        results = results[0];
                    }

                    this.sendSplit(message, results);
                    break;

                case 'array':
                default:
                    this.setContextValue(
                        results,
                        this.nodeConfig.output_location_type,
                        this.nodeConfig.output_location,
                        message
                    );

                    this.node.send(message);
                    break;
            }

            this.setStatusSuccess();
        }
    }

    RED.nodes.registerType('api-get-history', GetHistoryNode);
};
