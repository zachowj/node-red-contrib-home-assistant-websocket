const Joi      = require('joi');
const BaseNode = require('../../lib/base-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            template: {},
            name: {},
            server: { isNode: true }
        },
        input: {
            template: {
                messageProp: 'template',
                configProp: 'template',
                validation: { haltOnFail: true, schema: Joi.string().required() }
            }
        }
    };

    class RenderTemplateNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            let { template } = parsedMessage;
            template  = template.value;

            return this.nodeConfig.server.api.renderTemplate(template)
                .then(res => {
                    message.template = template;
                    message.payload = res;
                    this.send(message);
                    this.status({fill: 'green', shape: 'dot', text: 'Success'});
                })
                .catch(err => {
                    this.error(`Error calling service, home assistant api error: ${err.message}`, message);
                    this.status({fill: 'red', shape: 'ring', text: 'Error'});
                });
        }
    }

    RED.nodes.registerType('api-render-template', RenderTemplateNode);
};
