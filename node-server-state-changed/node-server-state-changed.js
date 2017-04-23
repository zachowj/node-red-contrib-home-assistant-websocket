'use strict';
const debug = require('debug')('home-assistant:server-state-changed');

const incomingEvents = {
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

        if (shouldSkip) { debug('Skipping event, state unchanged new vs. old'); }
        return shouldSkip;
    },
    shouldSkipIfState: function shouldSkipIfState(e, skipIfState) {
        if (!skipIfState) { return false; }
        const shouldSkip = (skipIfState === e.event.new_state.state);
        if (shouldSkip) { debug('Skipping event, incoming event state === skipIfState setting'); }
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
        if (incomingEvents.shouldSkipNoChange(evt, node)) { return null; }
        if (incomingEvents.shouldSkipIfState(evt, node.settings.skipIfState)) { return null; }

        const { entity_id, event } = evt;
        const msg = {
            topic:   entity_id,
            payload: event.new_state.state,
            event:   event
        };

        if (incomingEvents.shouldIncludeEvent(entity_id, node.settings)) {
            node.send(msg);
        } else {
            debug('Skipping event due to include or blacklist filter');
        }
    },
    handlers: {
        onStateChanged: (evt) => {
            incomingEvents.onIncomingMessage(evt, incomingEvents.node)
        },
        onClose: () => {
            incomingEvents.setStatus(false, incomingEvents.node)
        },
        onOpen: () => {
            incomingEvents.setStatus(true, incomingEvents.node)
        },
        onError: (err) => {
            incomingEvents.setStatus(false, incomingEvents.node)
        }
    }
}



module.exports = function(RED) {
    function EventsStateChange(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.settings = incomingEvents.getSettings(config);

        node.server = RED.nodes.getNode(config.server);
        incomingEvents.setStatus(false, node);
        incomingEvents.node = node;

        // If the event source was setup start listening for events
        if (node.server) {
            if (node.server.connected) {  incomingEvents.setStatus(true, node); }
            const eventsClient = node.server.events;

            eventsClient.on('ha_events:state_changed', incomingEvents.handlers.onStateChanged);
            eventsClient.on('ha_events:close',         incomingEvents.handlers.onClose);
            eventsClient.on('ha_events:open',          incomingEvents.handlers.onOpen);
            eventsClient.on('ha_events:error',         incomingEvents.handlers.onError);

            this.on('close', function(done) {
                eventsClient.removeListener('ha_events:state_changed', incomingEvents.handlers.onStateChanged);
                eventsClient.removeListener('ha_events:close',         incomingEvents.handlers.onClose);
                eventsClient.removeListener('ha_events:open',          incomingEvents.handlers.onOpen);
                eventsClient.removeListener('ha_events:error',         incomingEvents.handlers.onError);
                done();
            });
        }
    }
    RED.nodes.registerType('server-state-changed', EventsStateChange);
};
