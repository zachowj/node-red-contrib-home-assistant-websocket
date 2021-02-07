const Joi = require('joi');

const BaseNode = require('./BaseNode');

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

module.exports = class RenderTemplateNode extends BaseNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });
    }

    onInput({ parsedMessage, message, send, done }) {
        if (!this.homeAssistant) {
            this.setStatusFailed('No server');
            done('No valid Home Assistant server selected.');
            return;
        }

        const {
            template,
            templateLocation,
            templateLocationType,
            resultsLocation,
            resultsLocationType,
        } = parsedMessage;

        this.setStatusSending('Requesting');

        return this.homeAssistant
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

                send(message);
                this.setStatusSuccess();
                done();
            })
            .catch((err) => {
                this.setStatusFailed('Error');
                done(`Error get-template: ${err.message}`);
            });
    }
};
