const Joi = require('joi');

const BaseNode = require('../BaseNode');

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

class RenderTemplate extends BaseNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });
    }

    onInput({ parsedMessage, message, send, done }) {
        if (!this.homeAssistant) {
            this.status.setFailed('No server');
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

        this.status.setSending('Requesting');

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
                this.status.setSuccess();
                done();
            })
            .catch((err) => {
                this.status.setFailed('Error');
                done(`Error get-template: ${err.message}`);
            });
    }
}

module.exports = RenderTemplate;
