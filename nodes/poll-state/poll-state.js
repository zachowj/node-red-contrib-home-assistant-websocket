/* eslint-disable camelcase */
const ta = require('time-ago');
const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            entity_id: nodeDef => (nodeDef.entity_id || '').trim(),
            updateinterval: nodeDef =>
                !isNaN(nodeDef.updateinterval)
                    ? Number(nodeDef.updateinterval)
                    : 60,
            updateIntervalUnits: {},
            outputinitially: {},
            outputonchanged: {},
            state_type: nodeDef => nodeDef.state_type || 'str',
            halt_if: {},
            halt_if_type: nodeDef => nodeDef.halt_if_type || 'str',
            halt_if_compare: nodeDef => nodeDef.halt_if_compare || 'is'
        }
    };

    class TimeSinceStateNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.init();
        }

        init() {
            if (!this.nodeConfig.entity_id) {
                throw new Error('Entity Id is required');
            }

            if (!this.timer) {
                const interval = this.nodeConfig.updateinterval;

                switch (this.nodeConfig.updateIntervalUnits) {
                    case 'minutes':
                        this.updateInterval = interval * (60 * 1000);
                        break;
                    case 'hours':
                        this.updateInterval = interval * (60 * 60 * 1000);
                        break;
                    default:
                        this.updateInterval = interval * 1000;
                }
                this.timer = setInterval(
                    this.onTimer.bind(this),
                    this.updateInterval
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

        onClose() {
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
                    await this.nodeConfig.server.homeAssistant.getStates(
                        this.nodeConfig.entity_id
                    )
                );

                if (!pollState.entity_id) {
                    this.error(
                        `could not find state with entity_id "${
                            this.nodeConfig.entity_id
                        }"`,
                        {}
                    );
                    this.status({
                        fill: 'red',
                        shape: 'ring',
                        text: `no state found for ${this.nodeConfig.entity_id}`
                    });
                    return;
                }

                const dateChanged = this.calculateTimeSinceChanged(pollState);
                if (!dateChanged) {
                    this.error(
                        `could not calculate time since changed for entity_id "${
                            this.nodeConfig.entity_id
                        }"`,
                        {}
                    );
                    return;
                }
                pollState.timeSinceChanged = ta.ago(dateChanged);
                pollState.timeSinceChangedMs =
                    Date.now() - dateChanged.getTime();

                // Convert and save original state if needed
                if (this.nodeConfig.state_type !== 'str') {
                    pollState.original_state = pollState.state;
                    pollState.state = this.getCastValue(
                        this.nodeConfig.state_type,
                        pollState.state
                    );
                }

                const msg = {
                    topic: this.nodeConfig.entity_id,
                    payload: pollState.state,
                    data: pollState
                };

                const isIfState = await this.getComparatorResult(
                    this.nodeConfig.halt_if_compare,
                    this.nodeConfig.halt_if,
                    pollState.state,
                    this.nodeConfig.halt_if_type,
                    {
                        entity: pollState
                    }
                );

                // Handle version 0 'halt if' outputs
                if (this.nodeConfig.version < 1) {
                    if (this.nodeConfig.halt_if && isIfState) {
                        this.setStatusFailed(pollState.state);
                        this.send([null, msg]);
                        return;
                    }
                    this.setStatusSuccess(pollState.state);
                    this.send([msg, null]);
                    return;
                }

                // Check 'if state' and send to correct output
                if (this.nodeConfig.halt_if && !isIfState) {
                    this.setStatusFailed(pollState.state);
                    this.send([null, msg]);
                    return;
                }

                this.setStatusSuccess(pollState.state);
                this.send([msg, null]);
            } catch (e) {
                throw e;
            }
        }

        calculateTimeSinceChanged(entityState) {
            const entityLastChanged = entityState.last_changed;
            return new Date(entityLastChanged);
        }
    }
    RED.nodes.registerType('poll-state', TimeSinceStateNode);
};
