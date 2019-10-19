/* eslint-disable camelcase */
const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            entityidfilter: nodeDef => {
                if (!nodeDef.entityidfilter) return undefined;

                if (nodeDef.entityidfiltertype === 'substring')
                    return nodeDef.entityidfilter.split(',').map(f => f.trim());
                if (nodeDef.entityidfiltertype === 'regex')
                    return new RegExp(nodeDef.entityidfilter);
                return nodeDef.entityidfilter;
            },
            entityidfiltertype: {},
            haltIfState: nodeDef =>
                nodeDef.haltifstate ? nodeDef.haltifstate.trim() : null,
            halt_if_type: nodeDef => nodeDef.halt_if_type || 'str',
            halt_if_compare: nodeDef => nodeDef.halt_if_compare || 'is',
            outputinitially: {},
            state_type: nodeDef => nodeDef.state_type || 'str',
            output_only_on_state_change: {}
        }
    };

    class ServerStateChangedNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            let eventTopic = 'ha_events:state_changed';

            if (this.nodeConfig.entityidfiltertype === 'exact') {
                eventTopic = this.eventTopic = `ha_events:state_changed:${this.nodeConfig.entityidfilter}`;
            }

            this.addEventClientListener(
                eventTopic,
                this.onHaEventsStateChanged.bind(this)
            );

            if (this.nodeConfig.outputinitially) {
                // Here for when the node is deploy without the server config being deployed
                if (this.isConnected) {
                    this.onDeploy();
                } else {
                    this.addEventClientListener(
                        'ha_client:states_loaded',
                        this.onStatesLoaded.bind(this)
                    );
                }
            }
        }

        async onHaEventsStateChanged(evt, runAll) {
            try {
                const { entity_id, event } = this.utils.merge({}, evt);

                if (!event.new_state) {
                    return null;
                }

                event.new_state.timeSinceChangedMs =
                    Date.now() -
                    new Date(event.new_state.last_changed).getTime();

                // Convert and save original state if needed
                if (this.nodeConfig.state_type !== 'str') {
                    if (event.old_state) {
                        event.old_state.original_state = event.old_state.state;
                        event.old_state.state = this.getCastValue(
                            this.nodeConfig.state_type,
                            event.old_state.state
                        );
                    }
                    event.new_state.original_state = event.new_state.state;
                    event.new_state.state = this.getCastValue(
                        this.nodeConfig.state_type,
                        event.new_state.state
                    );
                }

                if (!this.shouldIncludeEvent(entity_id)) {
                    return null;
                }

                if (
                    runAll === undefined &&
                    this.nodeConfig.output_only_on_state_change === true &&
                    event.old_state &&
                    event.old_state.state === event.new_state.state
                ) {
                    return null;
                }

                // Check if 'if state' is true
                let isIfState;
                try {
                    isIfState = await this.getComparatorResult(
                        this.nodeConfig.halt_if_compare,
                        this.nodeConfig.haltIfState,
                        event.new_state.state,
                        this.nodeConfig.halt_if_type,
                        {
                            entity: event.new_state,
                            prevEntity: event.old_state
                        }
                    );
                } catch (e) {
                    this.setStatusFailed('Error');
                    this.node.error(e.message, {});
                    return;
                }

                const msg = {
                    topic: entity_id,
                    payload: event.new_state.state,
                    data: event
                };

                // Handle version 0 'halt if' outputs
                if (this.nodeConfig.version < 1) {
                    if (this.nodeConfig.haltIfState && isIfState) {
                        this.setStatusFailed(event.new_state.state);
                        this.send([null, msg]);
                        return;
                    }
                    this.setStatusSuccess(event.new_state.state);
                    this.send([msg, null]);
                    return;
                }

                if (this.nodeConfig.haltIfState && !isIfState) {
                    this.setStatusFailed(event.new_state.state);
                    this.send([null, msg]);
                    return;
                }

                this.setStatusSuccess(event.new_state.state);
                this.send([msg, null]);
            } catch (e) {
                this.error(e);
            }
        }

        async onDeploy() {
            const entities = await this.nodeConfig.server.homeAssistant.getStates();
            this.onStatesLoaded(entities);
        }

        onStatesLoaded(entities) {
            for (const entityId in entities) {
                const eventMessage = {
                    event_type: 'state_changed',
                    entity_id: entityId,
                    event: {
                        entity_id: entityId,
                        old_state: entities[entityId],
                        new_state: entities[entityId]
                    }
                };

                this.onHaEventsStateChanged(eventMessage, true);
            }
        }

        shouldIncludeEvent(entityId) {
            if (!this.nodeConfig.entityidfilter) return true;
            const filter = this.nodeConfig.entityidfilter;
            const type = this.nodeConfig.entityidfiltertype;

            if (type === 'exact') {
                return filter === entityId;
            }

            if (type === 'substring') {
                const found = this.nodeConfig.entityidfilter.filter(
                    filterStr => entityId.indexOf(filterStr) >= 0
                );
                return found.length > 0;
            }

            if (type === 'regex') {
                return filter.test(entityId);
            }
        }
    }

    RED.nodes.registerType('server-state-changed', ServerStateChangedNode);
};
