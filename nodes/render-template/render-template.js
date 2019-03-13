const Joi = require('joi');
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
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .required()
                        .label('template')
                }
            }
        }
    };

    class RenderTemplateNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            let { template } = parsedMessage;
            template = template.value;

            if (this.nodeConfig.server === null) {
                this.node.error('No valid server selected.');
                return null;
            }

            this.setStatusSending('Requesting');

            return this.nodeConfig.server.http
                .renderTemplate(template)
                .then(res => {
                    message.template = template;
                    message.payload = res;
                    this.node.send(message);
                    this.setStatusSuccess();
                })
                .catch(err => {
                    let errorMessage =
                        'Error get-template, home assistant api error.';
                    if (this.utils.selectn('response.data.message', err))
                        errorMessage = `${errorMessage} Error Message: ${
                            err.response.data.message
                        }`;

                    this.error(errorMessage);
                    this.setStatusFailed('Error');
                });
        }
    }

    RED.nodes.registerType('api-render-template', RenderTemplateNode);
};
