const Joi = require('joi');

const BaseNode = require('./BaseNode');
const RenderTemplate = require('../helpers/mustache-context');

const nodeOptions = {
    config: {
        halt_if: {},
        halt_if_type: (nodeDef) => nodeDef.halt_if_type || 'str',
        halt_if_compare: (nodeDef) => nodeDef.halt_if_compare || 'is',
        override_topic: {},
        entity_id: {},
        state_type: (nodeDef) => nodeDef.state_type || 'str',
        state_location: (nodeDef) => nodeDef.state_location || 'payload',
        // state location type
        override_payload: (nodeDef) => {
            if (nodeDef.state_location === undefined) {
                return nodeDef.override_payload !== false ? 'msg' : 'none';
            }
            return nodeDef.override_payload;
        },
        entity_location: (nodeDef) => nodeDef.entity_location || 'data',
        // entity location type
        override_data: (nodeDef) => {
            if (nodeDef.entity_location === undefined) {
                return nodeDef.override_data !== false ? 'msg' : 'none';
            }
            return nodeDef.override_data;
        },
        blockInputOverrides: {},
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

        // default switch to true if undefined (backward compatibility)
        message.topic =
            config.override_topic !== false ? entityId : message.topic;

        // Set 'State Location'
        this.setContextValue(
            entity.state,
            config.override_payload,
            config.state_location,
            message
        );

        // Set 'Entity Location'
        this.setContextValue(
            entity,
            config.override_data,
            config.entity_location,
            message
        );

        // Handle version 0 'halt if' outputs
        if (config.version < 1) {
            if (config.halt_if && isIfState) {
                this.status.setFailed(entity.state);
                send([null, message]);
                done();
                return;
            }
            this.status.setSuccess(entity.state);
            send([message, null]);
            done();
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
