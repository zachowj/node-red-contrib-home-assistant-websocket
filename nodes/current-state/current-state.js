const BaseNode = require('../../lib/base-node');
const Joi = require('joi');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            name: {},
            halt_if: {},
            halt_if_type: {},
            halt_if_compare: {},
            override_topic: {},
            override_payload: {},
            override_data: {},
            entity_id: {},
            state_type: {},
            server: { isNode: true }
        },
        input: {
            entity_id: {
                messageProp: 'payload.entity_id',
                configProp: 'entity_id', // Will be used if value not found on message,
                validation: {
                    haltOnFail: true,
                    schema: Joi.string() // Validates on message if exists, Joi will also attempt coercion
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
            const entity_id = this.nodeConfig.entity_id
                ? this.nodeConfig.entity_id
                : parsedMessage.entity_id.value;
            const logAndContinueEmpty = logMsg => {
                this.node.warn(logMsg);
                return { payload: {} };
            };

            if (!entity_id)
                return logAndContinueEmpty(
                    'entity ID not set, cannot get current state, sending empty payload'
                );

            const currentState = this.utils.merge(
                {},
                await this.nodeConfig.server.homeAssistant.getStates(entity_id)
            );
            if (!currentState)
                return logAndContinueEmpty(
                    `entity could not be found in cache for entity_id: ${entity_id}, sending empty payload`
                );

            currentState.timeSinceChangedMs =
                Date.now() - new Date(currentState.last_changed).getTime();

            // Convert and save original state if needed
            if (
                this.nodeConfig.state_type &&
                this.nodeConfig.state_type !== 'str'
            ) {
                currentState.original_state = currentState.state;
                currentState.state = this.getCastValue(
                    this.nodeConfig.state_type,
                    currentState.state
                );
            }

            this.nodeConfig.halt_if_compare =
                this.nodeConfig.halt_if_compare || 'is';
            this.nodeConfig.halt_if_type =
                this.nodeConfig.halt_if_type || 'str';

            const isHaltValid = await this.getComparatorResult(
                this.nodeConfig.halt_if_compare,
                this.nodeConfig.halt_if,
                currentState.state,
                this.nodeConfig.halt_if_type
            );
            const shouldHaltIfState = this.nodeConfig.halt_if && isHaltValid;

            // default switch to true if undefined (backward compatibility
            const override_payload = this.nodeConfig.override_payload !== false;
            const override_topic = this.nodeConfig.override_topic !== false;
            const override_data = this.nodeConfig.override_data !== false;

            if (override_topic) message.topic = entity_id;
            if (override_payload) message.payload = currentState.state;
            if (override_data) message.data = currentState;

            if (shouldHaltIfState) {
                const debugMsg = `Get current state: halting processing due to current state of ${entity_id} matches "halt if state" option`;
                this.debug(debugMsg);
                this.debugToClient(debugMsg);
                this.status({
                    fill: 'red',
                    shape: 'ring',
                    text: `${currentState.state} at: ${this.getPrettyDate()}`
                });
                this.node.send([null, message]);
            } else {
                this.status({
                    fill: 'green',
                    shape: 'dot',
                    text: `${currentState.state} at: ${this.getPrettyDate()}`
                });
                this.node.send([message, null]);
            }
        }
    }

    RED.nodes.registerType('api-current-state', CurrentStateNode);
};
