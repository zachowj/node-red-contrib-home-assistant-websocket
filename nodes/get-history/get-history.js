const Joi = require('joi');
const timestring = require('timestring');
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
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
            output_type: {},
            output_location_type: {},
            output_location: {}
        },
        input: {
            startdate: {
                messageProp: 'startdate',
                configProp: 'startdate',
                default: () => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return yesterday.toISOString();
                },
                validation: {
                    schema: Joi.date()
                        .optional()
                        .allow('')
                }
            },
            enddate: {
                messageProp: 'enddate',
                configProp: 'enddate',
                validation: {
                    schema: Joi.date()
                        .optional()
                        .allow('')
                }
            },
            entityid: {
                messageProp: 'entityid',
                configProp: 'entityid'
            },
            entityidtype: {
                messageProp: 'entityidtype',
                configProp: 'entityidtype'
            },
            relativeTime: {
                messageProp: 'relativetime',
                configProp: 'relativeTime'
            }
        }
    };

    class GetHistoryNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        async onInput({ parsedMessage, message }) {
            let {
                startdate,
                enddate,
                entityid,
                entityidtype,
                relativeTime
            } = parsedMessage;
            startdate = startdate.value;
            enddate = enddate.value;
            entityid = entityid.value;
            relativeTime = relativeTime.value;
            let useRelativeTime = this.nodeConfig.useRelativeTime;

            if (this.nodeConfig.server === null) {
                this.node.error('No valid server selected.');
                return null;
            }

            if (
                useRelativeTime ||
                parsedMessage.relativeTime.source === 'message'
            ) {
                startdate = new Date(
                    Date.now() - timestring(relativeTime, 'ms')
                ).toISOString();
            }

            let apiRequest =
                entityidtype.value === 'includes' && entityid
                    ? this.nodeConfig.server.api.getHistory(
                          startdate,
                          null,
                          enddate,
                          {
                              include: new RegExp(entityid)
                          }
                      )
                    : this.nodeConfig.server.api.getHistory(
                          startdate,
                          entityid,
                          enddate
                      );

            this.status({
                fill: 'yellow',
                shape: 'dot',
                text: `Requesting at: ${this.getPrettyDate()}`
            });

            try {
                var results = await apiRequest;
                message.startdate = startdate;
                message.enddate = enddate || null;
                message.entityid = entityid || null;
            } catch (err) {
                let errorMessage =
                    'Error get-history, home assistant api error.';
                if (this.utils.selectn('response.data.message', err))
                    errorMessage = `${errorMessage} Error Message: ${
                        err.response.data.message
                    }`;
                this.error(errorMessage);

                this.status({
                    fill: 'red',
                    shape: 'ring',
                    text: `Error at: ${this.getPrettyDate()}`
                });

                return null;
            }

            if (this.nodeConfig.output_location === undefined) {
                this.nodeConfig.output_location = 'payload';
                this.nodeConfig.output_location_type = 'msg';
            }

            switch (this.nodeConfig.output_type) {
                case 'split':
                    if (results.length === 0) {
                        this.status({
                            fill: 'red',
                            shape: 'dot',
                            text: `No Results at: ${this.getPrettyDate()}`
                        });
                        return;
                    }
                    if (entityidtype.value === 'is') {
                        results = results[0];
                    }

                    this.sendSplit(message, results);
                    break;

                case 'array':
                default:
                    const contextKey = RED.util.parseContextStore(
                        this.nodeConfig.output_location
                    );
                    const locationType = this.nodeConfig.output_location_type;
                    if (locationType === 'flow' || locationType === 'global') {
                        this.node
                            .context()
                            [locationType].set(
                                contextKey.key,
                                results,
                                contextKey.store
                            );
                    } else {
                        message[contextKey.key] = results;
                    }

                    this.node.send(message);
                    break;
            }

            this.status({
                fill: 'green',
                shape: 'dot',
                text: `Success at: ${this.getPrettyDate()}`
            });
        }
    }

    RED.nodes.registerType('api-get-history', GetHistoryNode);
};
