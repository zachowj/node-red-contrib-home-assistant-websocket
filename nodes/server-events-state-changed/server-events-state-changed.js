const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            entityIdFilter: (nodeDef) => nodeDef.entityidfilter ? nodeDef.entityidfilter.split(',').map(f => f.trim()) : null,
            haltIfState:    (nodeDef) => nodeDef.haltifstate ? nodeDef.haltifstate.trim() : null
        }
    };

    class ServerStateChangedNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.addEventClientListener({ event: 'ha_events:state_changed', handler: this.onHaEventsStateChanged.bind(this) });
        }

        onHaEventsStateChanged (evt) {
            const { entity_id, event } = evt;

            // TODO: Infrequent issue seen where event encountered without new_state, logging to pick up info
            if (!event || !event.new_state) {
                this.debug('Warning, event encountered without new_state');
                this.debug(JSON.stringify(event));
                this.warn(event);
                return null;
            }

            const shouldHaltIfState  = this.shouldHaltIfState(event);
            const shouldIncludeEvent = this.shouldIncludeEvent(entity_id);

            if (shouldHaltIfState) {
                // TODO: Change all status to use a node option (log flow messages?) and log this on a
                // per node basis rather than flashing status
                this.warn('state halted status');
                return null;
            }

            const msg = {
                topic:   entity_id,
                payload: event.new_state.state,
                data:    event
            };

            if (shouldIncludeEvent) {
                (event.old_state)
                    ? this.debug(`Incoming state event: entity_id: ${event.entity_id}, new_state: ${event.new_state.state}, old_state: ${event.old_state.state}`)
                    : this.debug(`Incoming state event: entity_id: ${event.entity_id}, new_state: ${event.new_state.state}`);

                this.send(msg);
            }
        }

        shouldHaltIfState (haEvent, haltIfState) {
            if (!this.nodeConfig.haltIfState) return false;
            const shouldHalt = (this.nodeConfig.haltIfState === haEvent.new_state.state);
            return shouldHalt;
        }

        shouldIncludeEvent (entityId) {
            if (!this.nodeConfig.entityIdFilter) return true;
            const found = this.nodeConfig.entityIdFilter.filter(filterStr => (entityId.indexOf(filterStr) >= 0));
            return found.length > 0;
        }
    }

    RED.nodes.registerType('server-state-changed', ServerStateChangedNode);
};
