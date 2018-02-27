const Joi      = require('joi');
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            startdate: {},
            name:      {},
            server:    { isNode: true }
        },
        input: {
            startdate: {
                messageProp: 'startdate',
                configProp:  'startdate',
                default:     () => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return yesterday.toISOString();
                },
                validation: { haltOnFail: true, schema: Joi.date().optional().allow('') }
            }
        }
    };

    class GetHistoryNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            let { startdate } = parsedMessage;
            startdate  = startdate.value;

            return this.nodeConfig.server.api.getHistory(startdate)
                .then(res => {
                    message.startdate = startdate;
                    message.payload = res;
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
