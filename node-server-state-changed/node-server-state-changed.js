'use strict';
const nodeUtils = require('../utils/node-utils');

const _int = {
    getSettings: function getSettings(config) {
        const settings = {
            entityIdFilter: config.entityidfilter ? config.entityidfilter.split(',').map(f => f.trim()): null,
            haltIfState:    config.haltifstate ? config.haltifstate.trim() : null
        };
        return settings;
    },
    shouldHaltIfState: function shouldHaltIfState(haEvent, haltIfState) {
        if (!haltIfState) { return false; }
        const shouldHalt = (haltIfState === haEvent.new_state.state);
        return shouldHalt;
    },
    shouldIncludeEvent: function shouldIncludeEvent(entityId, { entityIdFilter }) {
        if (!entityIdFilter) { return true; }
        const found = entityIdFilter.filter(filterStr => (entityId.indexOf(filterStr) >= 0));
        return found.length > 0;
    },
    /* eslint-disable consistent-return */
    onIncomingMessage: function onIncomingMessage(evt, node) {
        const { entity_id, event } = evt;
        // TODO: Infrequent issue seen where event encountered without new_state, logging to pick up info
        if (!event || !event.new_state) {
            node.debug('Warning, event encountered without new_state');
            node.debug(JSON.stringify(event));
            node.warn(event);
        } else {
            const shouldHaltIfState  = _int.shouldHaltIfState(event, node.settings.haltIfState);
            const shouldIncludeEvent = _int.shouldIncludeEvent(entity_id, node.settings);

            if (shouldHaltIfState) {
                nodeUtils.flashFlowHaltedStatus(node);
                return null;
            }

            const msg = {
                topic:   entity_id,
                payload: event.new_state.state,
                data:    event
            };

            if (shouldIncludeEvent) {
                node.debug(`Incoming state event: entity_id: ${event.entity_id}, new_state: ${event.new_state.state}, old_state: ${event.old_state.state}`);
                nodeUtils.flashAttentionStatus(node, { appendMsg: event.new_state.state });
                node.send(msg);
            }
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
        node.status({});

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
