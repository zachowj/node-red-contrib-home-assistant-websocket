'use strict';
const nodeUtils = require('../utils/node-utils');

const _int = {
    getSettings: function getSettings(config) {
        const settings = {
            entityIdFilter:    config.entityidfilter ? config.entityidfilter.split(',').map(f => f.trim()) : null,
            entityIdBlacklist: config.entityidblacklist ? config.entityidblacklist.split(',').map(f => f.trim()) : null,
            skipIfState:       config.skipifstate
        };

        return settings;
    },
    shouldSkipIfState: function shouldSkipIfState(e, skipIfState) {
        if (!skipIfState) { return false; }
        const shouldSkip = (skipIfState === e.event.new_state.state);
        return shouldSkip;
    },
    shouldIncludeEvent: function shouldIncludeEvent(entityId, { entityIdFilter, entityIdBlacklist }) {
        // If neither filter is sent just send the event on
        if (!entityIdFilter && !entityIdBlacklist) { return true; }

        const findings = {};
        // If include filter is null then set to found
        if (!entityIdFilter) { findings.included = true; }

        if (entityIdFilter && entityIdFilter.length) {
            const found = entityIdFilter.filter(iStr => (entityId.indexOf(iStr) >= 0));
            findings.included =  (found.length > 0);
        }

        // If blacklist is null set exluded false
        if (!entityIdBlacklist) { findings.excluded = false; }

        if (entityIdBlacklist && entityIdBlacklist.length) {
            const found = entityIdBlacklist.filter(blStr => (entityId.indexOf(blStr) >= 0));
            findings.excluded =  (found.length > 0);
        }

        return findings.included && !findings.excluded;
    },
    /* eslint-disable consistent-return */
    onIncomingMessage: function onIncomingMessage(evt, node) {
        if (_int.shouldSkipIfState(evt, node.settings.skipIfState)) { return null; }

        const { entity_id, event } = evt;
        const msg = {
            topic:   entity_id,
            payload: event.new_state.state,
            event:   event
        };

        if (_int.shouldIncludeEvent(entity_id, node.settings)) {
            nodeUtils.flashStatus(node, { status: { fill: 'green', shape: 'ring' }});
            node.send(msg);
        }
    },
    getHandlers: function(node) {
        return {
            onStateChanged: (evt) => _int.onIncomingMessage(evt, node),
            onClose:        ()    => nodeUtils.setConnectionStatus(node, false),
            onOpen:         ()    => nodeUtils.setConnectionStatus(node, true),
            onError:        (err) => nodeUtils.setConnectionStatus(node, false, err)
        };
    }
}

module.exports = function(RED) {
    function EventsStateChange(config) {
        const node = this;
        RED.nodes.createNode(node, config);

        node._state = {};
        node.settings = _int.getSettings(config);
        node.server = RED.nodes.getNode(config.server);

        // If the event source was setup start listening for events
        if (node.server) {
            nodeUtils.setConnectionStatus(node, node.server.events.connected);

            const handlers = _int.getHandlers(node);
            const eventsClient = node.server.events;

            eventsClient.on('ha_events:state_changed', handlers.onStateChanged);
            eventsClient.on('ha_events:close',         handlers.onClose);
            eventsClient.on('ha_events:open',          handlers.onOpen);
            eventsClient.on('ha_events:error',         handlers.onError);

            this.on('close', function(done) {
                eventsClient.removeListener('ha_events:state_changed', handlers.onStateChanged);
                eventsClient.removeListener('ha_events:close',         handlers.onClose);
                eventsClient.removeListener('ha_events:open',          handlers.onOpen);
                eventsClient.removeListener('ha_events:error',         handlers.onError);
                done();
            });
        } else {
            nodeUtils.setConnectionStatus(node, false);
        }
    }
    RED.nodes.registerType('server-state-changed', EventsStateChange);
};
