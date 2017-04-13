'use strict';
const debug = require('debug')('ha-eventer:server-events');

const incomingEvents = {
    getSettings: function getSettings(config) {
        const settings = {
            eventTypeFilter:   config.eventtypefilter,
            entityIdFilter:    config.entityidfilter ? config.entityidfilter.split(',').map(f => f.trim()) : null,
            entityIdBlacklist: config.entityidblacklist ? config.entityidblacklist.split(',').map(f => f.trim()) : null,
            skipNoChange:      config.skipnochange
        };

        return settings;
    },
    setStatus: function setStatus(isConnected, node) {
        if (isConnected) { node.status({ fill: 'green', shape: 'ring', text: 'Connected' }); }
        else { node.status({ fill: 'red', shape: 'ring', text: 'Disconnected' }) }
    },
    shouldSkipEvent: function shouldSkipEvent(e, node) {
        if (!node.settings.skipNoChange) { return false; }
        if (!e.event || !e.event.old_state || !e.event.new_state) { return false; }
        const shouldSkip = (e.event.old_state.state === e.event.new_state.state);

        if (shouldSkip) { debug('Skipping event, state unchanged new vs. old'); }
        return shouldSkip;
    },
    shouldIncludeEvent: function shouldIncludeEvent(entityId, { entityIdFilter, entityIdBlacklist }) {
        const findings = {};
        // If include filter is null then set to found
        if (!entityIdFilter) { findings.included = true; }

        if (entityIdFilter && entityIdFilter.length) {
            const found = entityIdFilter.filter(iStr => (entityId.indexOf(iStr) >= 0));
            findings.included =  (found.length > 0);
        }

        // If include filter is null then set to found
        if (!entityIdBlacklist) { findings.excluded = false; }

        if (entityIdBlacklist && entityIdBlacklist.length) {
            const found = entityIdBlacklist.filter(blStr => (entityId.indexOf(blStr) >= 0));
            findings.excluded =  (found.length > 0);
        }

        return findings.included && !findings.excluded;
    },
    /* eslint-disable consistent-return */
    onIncomingMessage: function onIncomingMessage(evt, node) {
        if (incomingEvents.shouldSkipEvent(evt, node)) { return null; }

        const isStateChangedListener = (node.settings.eventTypeFilter === 'state_changed');

        const { event_type, entity_id, event } = evt;
        const msg = {
            event_type: event_type,
            entity_id:  entity_id,
            topic:      (entity_id) ? `${event_type}:${entity_id}` : event_type,
            payload:    (isStateChangedListener) ? event.new_state.state : event,
            event:      event
        };

        // If no filters just send
        if (!node.settings.entityIdFilter && !node.settings.entityIdBlacklist) {
            node.send(msg);
        // If include or blacklist do not send if filtered
        } else if (incomingEvents.shouldIncludeEvent(entity_id, node.settings)) {
            node.send(msg);
        // Sending because filter check passed
        } else {
            debug('Skipping event due to include or blacklist filter');
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

        // If the eventsource was setup start listening for events
        if (node.server) {
            if (node.server.connected) {  incomingEvents.setStatus(true, node); }

            const eventsClient = node.server.events;

            // Will eitner be events_state_changed, events_all, or events_<some other ha event>
            eventsClient.on(`ha_events:${node.settings.eventTypeFilter}`, (evt) => incomingEvents.onIncomingMessage(evt, node));
            eventsClient.on('ha_events:close', () => incomingEvents.setStatus(false, node));
            eventsClient.on('ha_events:open', () => incomingEvents.setStatus(true, node));
            eventsClient.on('ha_events:error', (err) => node.warn(err));
        }
    }

    RED.nodes.registerType('server-events', EventsStateChange);
};
