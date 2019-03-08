/* eslint-disable camelcase */
const ta = require('time-ago');
const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            entity_id: {},
            updateinterval: {},
            updateIntervalUnits: {},
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
            this.entityId = (this.nodeConfig.entity_id || '').trim();
            this.init();
        }

        init() {
            if (!this.entityId) {
                throw new Error('Entity Id is required');
            }

            if (!this.timer) {
                const interval =
                    !this.nodeConfig.updateinterval ||
                    parseInt(this.nodeConfig.updateinterval) < 1
                        ? 10
                        : parseInt(this.nodeConfig.updateinterval);

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
                    event: `ha_events:state_changed:${this.entityId}`,
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
                        this.entityId
                    )
                );

                if (!pollState.entity_id) {
                    this.warn(
                        `could not find state with entity_id "${this.entityId}"`
                    );
                    this.status({
                        fill: 'red',
                        shape: 'ring',
                        text: `no state found for ${this.entityId}`
                    });
                    return;
                }

                const dateChanged = this.calculateTimeSinceChanged(pollState);
                if (!dateChanged) {
                    this.warn(
                        `could not calculate time since changed for entity_id "${
                            this.entityId
                        }"`
                    );
                    return;
                }
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
                    topic: this.entityId,
                    payload: pollState.state,
                    data: pollState
                };

                if (shouldHaltIfState) {
                    const debugMsg = `poll state: halting processing due to current state of ${
                        pollState.entity_id
                    } matches "halt if state" option`;
                    this.debug(debugMsg);
                    this.debugToClient(debugMsg);
                    this.setStatusFailed(pollState.state);
                    return this.send([null, msg]);
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
