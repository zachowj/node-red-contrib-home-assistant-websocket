'use strict';
const debug = require('debug')('home-assistant:server-state-changed');

const _int = {
    getSettings: function getSettings(config) {
        const settings = {
            entityIdFilter:    config.entityidfilter ? config.entityidfilter.split(',').map(f => f.trim()) : null,
            entityIdBlacklist: config.entityidblacklist ? config.entityidblacklist.split(',').map(f => f.trim()) : null,
            skipIfState:       config.skipifstate
        };

        return settings;
    },
    setStatus: function setStatus(isConnected, node) {
        if (isConnected) { node.status({ fill: 'green', shape: 'ring', text: 'Connected' }); }
        else { node.status({ fill: 'red', shape: 'ring', text: 'Disconnected' }) }
    },
    shouldSkipNoChange: function shouldSkipNoChange(e, node) {
        if (!e.event || !e.event.old_state || !e.event.new_state) { return false; }
        const shouldSkip = (e.event.old_state.state === e.event.new_state.state);
        return shouldSkip;
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
        if (_int.shouldSkipNoChange(evt, node)) { return null; }
        if (_int.shouldSkipIfState(evt, node.settings.skipIfState)) { return null; }

        const { entity_id, event } = evt;
        const msg = {
            topic:   entity_id,
            payload: event.new_state.state,
            event:   event
        };

        if (_int.shouldIncludeEvent(entity_id, node.settings)) {
            node.send(msg);
        }
    },
    getHandlers: function(node) {
        return {
            onStateChanged: (evt) => _int.onIncomingMessage(evt, node),
            onClose:        ()    => _int.setStatus(false, node),
            onOpen:         ()    => _int.setStatus(true, node),
            onError:        (err) => _int.setStatus(false, node)
        };
    }
}

module.exports = function(RED) {
    function EventsStateChange(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.settings = _int.getSettings(config);

        node.server = RED.nodes.getNode(config.server);
        _int.setStatus(false, node);
        const handlers = _int.getHandlers(node);

        // If the event source was setup start listening for events
        if (node.server) {
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
        }
    }
    RED.nodes.registerType('server-state-changed', EventsStateChange);
};
