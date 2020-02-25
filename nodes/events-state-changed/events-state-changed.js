/* eslint-disable camelcase */
const EventsHaNode = require('../../lib/events-ha-node');

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

    class ServerStateChangedNode extends EventsHaNode {
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
            const config = this.nodeConfig;
            if (this.isEnabled === false) {
                return;
            }
            const { entity_id, event } = this.utils.merge({}, evt);

            if (!event.new_state) {
                return null;
            }

            event.new_state.timeSinceChangedMs =
                Date.now() - new Date(event.new_state.last_changed).getTime();

            // Convert and save original state if needed
            if (config.state_type !== 'str') {
                if (event.old_state) {
                    event.old_state.original_state = event.old_state.state;
                    event.old_state.state = this.getCastValue(
                        config.state_type,
                        event.old_state.state
                    );
                }
                event.new_state.original_state = event.new_state.state;
                event.new_state.state = this.getCastValue(
                    config.state_type,
                    event.new_state.state
                );
            }

            if (!this.shouldIncludeEvent(entity_id)) {
                return;
            }

            if (
                runAll === undefined &&
                config.output_only_on_state_change === true &&
                event.old_state &&
                event.old_state.state === event.new_state.state
            ) {
                return;
            }

            // Check if 'if state' is true
            const isIfState = await this.getComparatorResult(
                config.halt_if_compare,
                config.haltIfState,
                event.new_state.state,
                config.halt_if_type,
                {
                    entity: event.new_state,
                    prevEntity: event.old_state
                }
            ).catch(e => {
                this.setStatusFailed('Error');
                this.node.error(e.message, {});
            });

            const msg = {
                topic: entity_id,
                payload: event.new_state.state,
                data: event
            };

            const statusMessage = `${event.new_state.state}${
                evt.event_type === 'triggered' ? ` (triggered)` : ''
            }`;

            // Handle version 0 'halt if' outputs. The output were reversed true
            // was sent to the second output and false was the first output
            if (config.version < 1) {
                if (config.haltIfState && isIfState) {
                    this.setStatusFailed(statusMessage);
                    this.send([null, msg]);
                    return;
                }
                this.setStatusSuccess(statusMessage);
                this.send([msg, null]);
                return;
            }

            if (config.haltIfState && !isIfState) {
                this.setStatusFailed(statusMessage);
                this.send([null, msg]);
                return;
            }

            this.setStatusSuccess(statusMessage);
            this.send([msg, null]);
        }

        getNodeEntityId() {
            return (
                this.nodeConfig.entityidfiltertype === 'exact' &&
                this.nodeConfig.entityidfilter
            );
        }

        triggerNode(eventMessage) {
            this.onHaEventsStateChanged(eventMessage, false);
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
    }

    RED.nodes.registerType('server-state-changed', ServerStateChangedNode);
};
