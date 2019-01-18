/* eslint-disable camelcase */
const ta = require('time-ago');
const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            entity_id: {},
            updateinterval: {},
            outputinitially: {},
            outputonchanged: {},
            state_type: {},
            halt_if: {},
            halt_if_type: {},
            halt_if_compare: {}
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
            if (!this.isConnected) return;

            try {
                const pollState = this.utils.merge(
                    {},
                    await this.getState(this.nodeConfig.entity_id)
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

                    // Convert and save original state if needed
                    if (
                        this.nodeConfig.state_type &&
                        this.nodeConfig.state_type !== 'str'
                    ) {
                        pollState.original_state = pollState.state;
                        pollState.state = this.getCastValue(
                            this.nodeConfig.state_type,
                            pollState.state
                        );
                    }

                    this.nodeConfig.halt_if_compare =
                        this.nodeConfig.halt_if_compare || 'is';
                    this.nodeConfig.halt_if_type =
                        this.nodeConfig.halt_if_type || 'str';

                    const shouldHaltIfState =
                        this.nodeConfig.halt_if &&
                        (await this.getComparatorResult(
                            this.nodeConfig.halt_if_compare,
                            this.nodeConfig.halt_if,
                            pollState.state,
                            this.nodeConfig.halt_if_type
                        ));

                    const msg = {
                        topic: this.nodeConfig.entity_id,
                        payload: pollState.state,
                        data: pollState
                    };

                    if (shouldHaltIfState) {
                        const debugMsg = `poll state: halting processing due to current state of ${
                            pollState.entity_id
                        } matches "halt if state" option`;
                        this.debug(debugMsg);
                        this.debugToClient(debugMsg);
                        this.status({
                            fill: 'red',
                            shape: 'ring',
                            text: `${
                                pollState.state
                            } at: ${this.getPrettyDate()}`
                        });
                        return this.send([null, msg]);
                    }

                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `${pollState.state} at: ${this.getPrettyDate()}`
                    });

                    this.send([msg, null]);
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
    RED.nodes.registerType('poll-state', TimeSinceStateNode);
};
