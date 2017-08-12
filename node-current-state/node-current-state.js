'use strict';
const _int = {
    getSettings: function(config, node) {
        node.entity_id = config.entity_id;
        node.halt_if   = config.halt_if;
    },
    /* eslint-disable consistent-return */
    onInput: function(msg, node) {
        const entity_id = (msg.payload && msg.payload.entity_id)
            ? msg.payload.entity_id
            : node.entity_id;

        if (!entity_id) {
            node.warn('Entity ID not set, cannot get current state');
            return null;
        }

        const currentState = node.server.homeAssistant.states[entity_id];
        if (!currentState) {
            node.warn(`entity could not be found in cache: ${entity_id}`);
            return null;
        }

        const shouldHaltIfState = node.halt_if && (currentState.state === node.halt_if);
        node.debug(`Get current state: Found entity: ${entity_id}, with state: ${currentState.state}`);
        if (shouldHaltIfState) {
            node.debug(`Get current state: halting processing due to current state of ${entity_id} matches "halt if state" option`);
            return null;
        }

        node.send({ payload: currentState });
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
