const Joi      = require('joi');
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            name:      {},
            server:    { isNode: true },
            startdate: {},
            enddate:   {},
            entityid:  {}
        },
        input: {
            startdate: {
                messageProp: 'startdate',
                configProp:   'startdate',
                default:     () => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return yesterday.toISOString();
                },
                validation: { haltOnFail: true, schema: Joi.date().optional().allow('') }
            },
            enddate: {
                messageProp: 'enddate',
                configProp:   'enddate',
                validation: { haltOnFail: true, schema: Joi.date().optional().allow('') }
            },
            entityid: {
                messageProp: 'entityid',
                configProp:   'entityid'
            }
        }
    };

    class GetHistoryNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            let { startdate, enddate, entityid } = parsedMessage;
            startdate  = startdate.value;
            enddate    = enddate.value;
            entityid   = entityid.value;

            return this.nodeConfig.server.api.getHistory(startdate, entityid, enddate)
                .then(res => {
                    message.startdate = startdate;
                    message.enddate   = enddate  || null;
                    message.entityid  = entityid || null;
                    message.payload   = res;
                    this.send(message);
                })
                .catch(err => {
                    this.warn('Error calling service, home assistant api error', err);
                    this.error('Error calling service, home assistant api error', message);
                });
        }
    }

    RED.nodes.registerType('api-get-history', GetHistoryNode);
};
