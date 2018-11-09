const Joi = require('joi');
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
            entityidtype: {}
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
                    haltOnFail: true,
                    schema: Joi.date()
                        .optional()
                        .allow('')
                }
            },
            enddate: {
                messageProp: 'enddate',
                configProp: 'enddate',
                validation: {
                    haltOnFail: true,
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
            }
        }
    };

    class GetHistoryNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            let { startdate, enddate, entityid, entityidtype } = parsedMessage;
            startdate = startdate.value;
            enddate = enddate.value;
            entityid = entityid.value;

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

            return apiRequest
                .then(res => {
                    message.startdate = startdate;
                    message.enddate = enddate || null;
                    message.entityid = entityid || null;
                    message.payload = res;
                    this.send(message);
                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `Success at: ${this.getPrettyDate()}`
                    });
                })
                .catch(err => {
                    this.warn(
                        'Error calling service, home assistant api error',
                        err
                    );
                    this.error(
                        'Error calling service, home assistant api error',
                        message
                    );
                    this.status({
                        fill: 'red',
                        shape: 'ring',
                        text: `Error at: ${this.getPrettyDate()}`
                    });
                });
        }
    }

    RED.nodes.registerType('api-get-history', GetHistoryNode);
};
