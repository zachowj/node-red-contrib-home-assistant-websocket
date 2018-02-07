const Joi      = require('joi');
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            service_domain: {},
            service:        {},
            data:           {},       // TODO: If string cast to object
            name:           {},
            server:         { isNode: true }
        },
        input: {
            domain: {
                messageProp: 'payload.domain',
                configProp:  'service_domain', // Will be used if value not found on message,
                validation:  { haltOnFail: true, schema: Joi.string().min(1).required() }
            },
            service: {
                messageProp: 'payload.service',
                configProp:  'service',
                validation:  { haltOnFail: true, schema: Joi.string().min(1).required() }
            },
            data: {                     // TODO: If found on payload then merge with config object if exists
                messageProp: 'payload.data',
                configProp:  'data',
                validation:  { schema: Joi.object({}) }
            }
        }
    };

    class CallServiceNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            let { domain, service, data } = parsedMessage;
            domain  = domain.value;
            service = service.value;
            data    = data.value;

            const isObjectLike = (v) => (v != null) && (typeof value == 'object'); // eslint-disable-line
            data = isObjectLike(data)
                ? JSON.stringify(data)
                : data;

            this.debug(`Calling Service: ${domain}:${service} -- ${data}`);

            return this.nodeConfig.server.api.callService(domain, service, data)
                .catch(err => {
                    this.warn('Error calling service, home assistant api error', err);
                    this.error('Error calling service, home assistant api error', message);
                });
        }
    }

    RED.nodes.registerType('api-call-service', CallServiceNode);
};
