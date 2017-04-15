'use strict';
const debug = require('debug')('home-assistant:current-state');

const _int = {
    getSettings: function(config, node) {
        node.entity_id = config.entity_id;
        node.halt_if   = config.halt_if;
    },
    onInput: function(msg, node) {
        const entity_id = (msg.payload && msg.payload.entity_id)
            ? msg.payload.entity_id
            : node.entity_id;

        if (!entity_id) {
            node.warn('Entity ID not set, cannot get current state');
        } else {
            const currentState = node.server.homeAssistant.states[entity_id];
            if (!currentState) {
                node.warn(`State not found for entity_id: ${entity_id}`);
            // Stop the flow execution if 'halt if' setting is set and true
            } else if (node.halt_if) {
                if (currentState.state === node.halt_if) { debug(`Halting flow, current state of ${entity_id} === ${node.halt_if}`); }
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
        node.server = RED.nodes.getNode(config.server);
        _int.getSettings(config, node);

        node.on('input', (msg) => _int.onInput(msg, node));
    }

    RED.nodes.registerType('current-state', CurrentState);
}
