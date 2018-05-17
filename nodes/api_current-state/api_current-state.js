const BaseNode = require('../../lib/base-node');
const Joi = require('joi');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            name: {},
            halt_if: {},
            entity_id: {},
            propertyType: {},
            property: {},
            server: { isNode: true }
        },
        input: {
            entity_id: {
                messageProp: 'payload.entity_id',
                configProp:  'entity_id', // Will be used if value not found on message,
                validation:  {
                    haltOnFail: true,
                    schema:     Joi.string()    // Validates on message if exists, Joi will also attempt coercion
                }
            }
        }
    };

    class CurrentStateNode  extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }

        /* eslint-disable camelcase */
        onInput({ parsedMessage, message }) {
            const entity_id = this.nodeConfig.entity_id ? this.nodeConfig.entity_id : parsedMessage.entity_id.value;
            const logAndContinueEmpty = (logMsg) => { this.node.warn(logMsg); return ({ payload: {}}) };

            if (!entity_id) return logAndContinueEmpty('entity ID not set, cannot get current state, sending empty payload');

            const { states } = this.nodeConfig.server.homeAssistant;
            if (!states) return logAndContinueEmpty('local state cache missing, sending empty payload');

            const currentState = states[entity_id];
      	    if (!currentState) return logAndContinueEmpty(`entity could not be found in cache for entity_id: ${entity_id}, sending empty payload`);
		
            const shouldHaltIfState = this.nodeConfig.halt_if && (currentState.state === this.nodeConfig.halt_if);
            if (shouldHaltIfState) {
                const debugMsg = `Get current state: halting processing due to current state of ${entity_id} matches "halt if state" option`;
                this.debug(debugMsg);
                this.debugToClient(debugMsg);
	        var prettyDate = new Date().toLocaleDateString("en-US",{month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric'});
		this.status({fill:"red",shape:"ring",text:`${currentState.state} at: ${prettyDate}`});
                return null;
            }

            // Output the currentState Object to the destination specified
            if (this.nodeConfig.propertyType == 'flow') {
                this.context().flow.set(this.nodeConfig.property, currentState);
            } else if (this.nodeConfig.propertyType == 'global') {
                this.context().global.set(this.nodeConfig.property, currentState);
            } else {
                RED.util.setMessageProperty(message, this.nodeConfig.property, currentState);
            }
	    var prettyDate = new Date().toLocaleDateString("en-US",{month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric'});
	    this.status({fill:"green",shape:"dot",text:`${currentState.state} at: ${prettyDate}`});
            this.node.send(message);
        }
    }

    RED.nodes.registerType('api-current-state', CurrentStateNode);
};
