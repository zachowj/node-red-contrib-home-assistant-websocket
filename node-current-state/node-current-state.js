'use strict';
const debug = require('debug')('ha-eventer:current-state');

const _int = {
    getSettings: function(config) {
        return {
            entity_id: config.entityid,
            haltIf:    config.haltif
        };
    },
    onInput: function(msg, node) {
        const entityId = (msg.payload && msg.payload.entity_id)
            ? msg.payload.entity_id
            : node.settings.entity_id;

        if (!entityId) {
            node.warn('Entity ID not set, no state to output');
        } else {
            const currentState = node.server.homeAssistant.states[entityId];
            if (!currentState) {
                node.warn(`State not found for entity_id: ${entityId}`);
            // Stop the flow execution if 'halt if' setting is set and true
            } else if (node.settings.haltIf) {
                if (currentState.state === node.settings.haltIf) { node.log('Halting flow, current state === haltIf setting'); }
                else { node.send({ payload: currentState }); }
            // Else just send on
            } else {
                node.send({ payload: currentState });
            }
        }
    }
};


module.exports = function(RED) {
    function CurrentState(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.server   = RED.nodes.getNode(config.server);
        node.settings = _int.getSettings(config);

        node.on('input', (msg) => _int.onInput(msg, node));
    }

    RED.nodes.registerType('current-state', CurrentState);
}
