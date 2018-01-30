'use strict';
const nodeUtils = require('../../utils/node-utils');

const _int = {
    getSettings: function(config, node) {
        node.entity_id = config.entity_id;
        node.halt_if   = config.halt_if;
    },
    /* eslint-disable consistent-return */
    // TODO: Look into adding the state api route to main config node and allowing direct polling as an option
    // to avoid any issues with having state out of sync
    onInput: function(msg, node) {
        const { states } = node.server.homeAssistant;
        node.status({});

        const entity_id = (msg.payload && msg.payload.entity_id)
            ? msg.payload.entity_id
            : node.entity_id;
        const currentState = node.server.homeAssistant.states[entity_id];

        const logAndContinueEmpty = (logMsg) => { node.warn(logMsg); return ({ payload: {}}) };

        // If connection issues occur there can be a situation where the state object isn't set before input enters
        if (!states)        { return logAndContinueEmpty('local state cache missing, sending empty payload') }
        if (!entity_id)     { return logAndContinueEmpty('entity ID not set, cannot get current state, sending empty payload') }
        if (!currentState)  { return logAndContinueEmpty(`entity could not be found in cache for entity_id: ${entity_id}, sending empty payload`) }

        const shouldHaltIfState = node.halt_if && (currentState.state === node.halt_if);
        node.debug(`Get current state: Found entity: ${entity_id}, with state: ${currentState.state}`);
        if (shouldHaltIfState) {
            node.debug(`Get current state: halting processing due to current state of ${entity_id} matches "halt if state" option`);
            nodeUtils.flashFlowHaltedStatus(node);
            return null;
        }

        node.send({ topic: entity_id, payload: currentState.state, data: currentState });
    }
};

module.exports = function(RED) {
    function CurrentState(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.server = RED.nodes.getNode(config.server);
        _int.getSettings(config, node);
        node.status({});
        node.on('input', (msg) => _int.onInput(msg, node));
    }

    RED.nodes.registerType('api-current-state', CurrentState);
};
