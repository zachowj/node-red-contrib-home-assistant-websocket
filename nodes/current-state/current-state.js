const BaseNode = require('../../lib/base-node');
const Joi = require('@hapi/joi');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            name: {},
            server: { isNode: true },
            halt_if: {},
            halt_if_type: {},
            halt_if_compare: {},
            override_topic: {},
            entity_id: {},
            state_type: {},
            state_location: {},
            override_payload: {}, // state location type
            entity_location: {},
            override_data: {} // entity location type
        },
        input: {
            entity_id: {
                messageProp: 'payload.entity_id',
                configProp: 'entity_id',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().label('entity_id')
                }
            }
        }
    };

    class CurrentStateNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        /* eslint-disable camelcase */
        async onInput({ parsedMessage, message }) {
            const config = this.nodeConfig;
            const entityId = parsedMessage.entity_id.value;

            if (config.server === null) {
                this.node.error('No valid server selected.');
                return;
            }

            const entity = this.utils.merge(
                {},
                await config.server.homeAssistant.getStates(entityId)
            );

            if (!entity.entity_id) {
                this.node.error(
                    `entity could not be found in cache for entity_id: ${entityId}`
                );
                return;
            }

            entity.timeSinceChangedMs =
                Date.now() - new Date(entity.last_changed).getTime();

            // Convert and save original state if needed
            if (config.state_type && config.state_type !== 'str') {
                entity.original_state = entity.state;
                entity.state = this.getCastValue(
                    config.state_type,
                    entity.state
                );
            }

            config.halt_if_compare = config.halt_if_compare || 'is';
            config.halt_if_type = config.halt_if_type || 'str';

            // default switch to true if undefined (backward compatibility)
            message.topic =
                config.override_topic !== false ? entityId : message.topic;

            // Set Defaults
            if (config.state_location === undefined) {
                config.state_location = 'payload';
                config.override_payload =
                    config.override_payload !== false ? 'msg' : 'none';
            }
            if (config.entity_location === undefined) {
                config.entity_location = 'data';
                config.override_data =
                    config.override_data !== false ? 'msg' : 'none';
            }

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

            const isHaltValid = await this.getComparatorResult(
                config.halt_if_compare,
                config.halt_if,
                entity.state,
                config.halt_if_type,
                {
                    message,
                    entity
                }
            );

            if (config.halt_if && isHaltValid) {
                this.setStatusFailed(entity.state);
                this.send([null, message]);
            } else {
                this.setStatusSuccess(entity.state);
                this.send([message, null]);
            }
        }
    }

    RED.nodes.registerType('api-current-state', CurrentStateNode);
};
