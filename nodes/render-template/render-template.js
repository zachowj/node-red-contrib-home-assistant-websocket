const Joi = require('joi');

const BaseNode = require('../../lib/base-node');

module.exports = function (RED) {
    const nodeOptions = {
        debug: true,
        config: {
            name: {},
            server: { isNode: true },
            template: {},
            resultsLocation: {},
            resultsLocationType: {},
            templateLocation: {},
            templateLocationType: {},
        },
        input: {
            template: {
                messageProp: 'template',
                configProp: 'template',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().required().label('template'),
                },
            },
            resultsLocation: {
                messageProp: 'resultsLocation',
                configProp: 'resultsLocation',
                default: 'payload',
            },
            resultsLocationType: {
                messageProp: 'resultsLocationType',
                configProp: 'resultsLocationType',
                default: 'msg',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid('msg', 'flow', 'global', 'none')
                        .label('resultsLocationType'),
                },
            },
            templateLocation: {
                messageProp: 'templateLocation',
                configProp: 'templateLocation',
                default: 'template',
            },
            templateLocationType: {
                messageProp: 'templateLocationType',
                configProp: 'templateLocationType',
                default: 'msg',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid('msg', 'flow', 'global', 'none')
                        .label('templateLocationType'),
                },
            },
        },
    };

    class RenderTemplateNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        onInput({ parsedMessage, message }) {
            const {
                template,
                templateLocation,
                templateLocationType,
                resultsLocation,
                resultsLocationType,
            } = parsedMessage;

            if (this.nodeConfig.server === null) {
                this.node.error('No valid server selected.', message);
                return;
            }

            this.setStatusSending('Requesting');

            return this.httpClient
                .renderTemplate(template.value)
                .then((res) => {
                    this.setContextValue(
                        template.value,
                        templateLocationType.value,
                        templateLocation.value,
                        message
                    );
                    this.setContextValue(
                        res,
                        resultsLocationType.value,
                        resultsLocation.value,
                        message
                    );

                    this.node.send(message);
                    this.setStatusSuccess();
                })
                .catch((err) => {
                    this.error(`Error get-template: ${err.message}`, message);
                    this.setStatusFailed('Error');
                });
        }
    }

    RED.nodes.registerType('api-render-template', RenderTemplateNode);
};
