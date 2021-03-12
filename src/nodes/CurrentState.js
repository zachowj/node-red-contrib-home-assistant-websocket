const Joi = require('joi');

const BaseNode = require('./BaseNode');
const RenderTemplate = require('../helpers/mustache-context');

const nodeOptions = {
    config: {
        halt_if: {},
        halt_if_type: {},
        halt_if_compare: {},
        override_topic: {},
        entity_id: {},
        outputProperties: {},
        blockInputOverrides: {},
        // deprecated
        state_type: {},
        state_location: {},
        override_payload: {},
        entity_location: {},
        override_data: {},
    },
    input: {
        entity_id: {
            messageProp: 'payload.entity_id',
            configProp: 'entity_id',
            validation: {
                haltOnFail: true,
                schema: Joi.string().label('entity_id'),
            },
        },
    },
};

class CurrentState extends BaseNode {
    constructor({ node, config, RED }) {
        super({ node, config, RED, nodeOptions });
    }

    /* eslint-disable camelcase */
    onInput({ parsedMessage, message, send, done }) {
        const config = this.nodeConfig;
        const entityId = RenderTemplate(
            config.blockInputOverrides === true
                ? config.entity_id
                : parsedMessage.entity_id.value,
            message,
            this.node.context(),
            config.server.name
        );

        if (config.server === null) {
            done('No valid server selected.');
            return;
        }

        const entity = this.homeAssistant.getStates(entityId);
        if (!entity) {
            done(
                `Entity could not be found in cache for entity_id: ${entityId}`
            );
            return;
        }

        entity.timeSinceChangedMs =
            Date.now() - new Date(entity.last_changed).getTime();

        // Convert and save original state if needed
        this.castState(entity, config.state_type);

        const isIfState = this.getComparatorResult(
            config.halt_if_compare,
            config.halt_if,
            entity.state,
            config.halt_if_type,
            {
                message,
                entity,
            }
        );

        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
                config: this.nodeConfig,
                entity,
                entityState: entity.state,
                triggerId: entityId,
            });
        } catch (e) {
            this.status.setFailed('error');
            done(e.message);
            return;
        }

        if (config.halt_if && !isIfState) {
            this.status.setFailed(entity.state);
            send([null, message]);
            done();
            return;
        }

        this.status.setSuccess(entity.state);
        send([message, null]);
        done();
    }
}

module.exports = CurrentState;
