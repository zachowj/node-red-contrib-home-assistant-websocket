/* eslint-disable camelcase */
const ta = require('time-ago');
const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            entity_id: {},
            updateinterval: {},
            outputinitially: {},
            outputonchanged: {}
        }
    };

    class TimeSinceStateNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.init();
        }

        init() {
            if (!this.nodeConfig.entity_id)
                throw new Error('Entity ID is required');

            if (!this.timer) {
                const interval =
                    !this.nodeConfig.updateinterval ||
                    parseInt(this.nodeConfig.updateinterval) < 1
                        ? 1
                        : parseInt(this.nodeConfig.updateinterval);
                this.timer = setInterval(
                    this.onTimer.bind(this),
                    interval * 1000
                );
            }

            if (this.nodeConfig.outputonchanged) {
                this.addEventClientListener({
                    event: `ha_events:state_changed:${
                        this.nodeConfig.entity_id
                    }`,
                    handler: this.onTimer.bind(this)
                });
            }

            if (this.nodeConfig.outputinitially) {
                this.addEventClientListener({
                    event: 'ha_events:states_loaded',
                    handler: this.onTimer.bind(this)
                });
            }
        }

        onClose(removed) {
            super.onClose();
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }

        async onTimer() {
            try {
                const pollState = await this.getState(
                    this.nodeConfig.entity_id
                );
                if (!pollState) {
                    this.warn(
                        `could not find state with entity_id "${
                            this.nodeConfig.entity_id
                        }"`
                    );
                    this.status({
                        fill: 'red',
                        shape: 'ring',
                        text: `no state found for ${this.nodeConfig.entity_id}`
                    });
                    return;
                }

                const dateChanged = this.calculateTimeSinceChanged(pollState);
                if (dateChanged) {
                    pollState.timeSinceChanged = ta.ago(dateChanged);
                    pollState.timeSinceChangedMs =
                        Date.now() - dateChanged.getTime();
                    this.send({
                        topic: this.nodeConfig.entity_id,
                        payload: pollState.state,
                        data: pollState
                    });

                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `${pollState.state} at: ${this.getPrettyDate()}`
                    });
                } else {
                    this.warn(
                        `could not calculate time since changed for entity_id "${
                            this.nodeConfig.entity_id
                        }"`
                    );
                }
            } catch (e) {
                throw e;
            }
        }

        calculateTimeSinceChanged(entityState) {
            const entityLastChanged = entityState.last_changed;
            return new Date(entityLastChanged);
        }

        async getState(entityId) {
            let state = await this.nodeConfig.server.homeAssistant.getStates(
                this.nodeConfig.entity_id
            );

            return state;
        }
    }
    RED.nodes.registerType('poll-state', TimeSinceStateNode, {
        settings: {
            pollStateAdminPrefix: {
                value: RED.settings.httpAdminRoot || '/',
                exportable: true
            }
        }
    });
};
