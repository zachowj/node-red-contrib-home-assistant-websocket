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
            outputinitially: {}
        }
    };

    class ServerStateChangedNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.addEventClientListener({
                event: 'ha_events:state_changed',
                handler: this.onHaEventsStateChanged.bind(this)
            });

            if (this.nodeConfig.outputinitially) {
                this.addEventClientListener({
                    event: 'ha_events:states_loaded',
                    handler: this.onDeploy.bind(this)
                });
            }
        }

        onHaEventsStateChanged(evt) {
            try {
                const { entity_id, event } = evt;

                if (!event.new_state) {
                    return null;
                }

                const shouldHaltIfState = this.shouldHaltIfState(event);
                const shouldIncludeEvent = this.shouldIncludeEvent(entity_id);

                if (shouldIncludeEvent) {
                    if (shouldHaltIfState) {
                        this.debug(
                            'flow halted due to "halt if state" setting'
                        );
                        this.status({
                            fill: 'red',
                            shape: 'ring',
                            text: `${
                                event.new_state.state
                            } at: ${this.getPrettyDate()}`
                        });

                        return null;
                    }

                    const msg = {
                        topic: entity_id,
                        payload: event.new_state.state,
                        data: event
                    };

                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `${
                            event.new_state.state
                        } at: ${this.getPrettyDate()}`
                    });
                    event.old_state
                        ? this.debug(
                              `Incoming state event: entity_id: ${
                                  event.entity_id
                              }, new_state: ${
                                  event.new_state.state
                              }, old_state: ${event.old_state.state}`
                          )
                        : this.debug(
                              `Incoming state event: entity_id: ${
                                  event.entity_id
                              }, new_state: ${event.new_state.state}`
                          );

                    return this.send(msg);
                }
                return null;
            } catch (e) {
                this.error(e);
            }
        }

        async onDeploy() {
            const entities = await this.nodeConfig.server.homeAssistant.getStates();

            for (let entityId in entities) {
                let eventMessage = {
                    event_type: 'state_changed',
                    entity_id: entityId,
                    event: {
                        entity_id: entityId,
                        old_state: entities[entityId],
                        new_state: entities[entityId]
                    }
                };

                this.onHaEventsStateChanged(eventMessage);
            }
        }

        shouldHaltIfState(haEvent, haltIfState) {
            if (!this.nodeConfig.haltIfState) return false;
            const shouldHalt =
                this.nodeConfig.haltIfState === haEvent.new_state.state;
            return shouldHalt;
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

    RED.nodes.registerType('server-state-changed', ServerStateChangedNode, {
        settings: {
            serverStateChangedAdminPrefix: {
                value: RED.settings.httpAdminRoot || '/',
                exportable: true
            }
        }
    });
};
