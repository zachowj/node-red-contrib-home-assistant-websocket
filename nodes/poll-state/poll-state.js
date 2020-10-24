/* eslint-disable camelcase */
const ta = require('time-ago');

const EventsHaNode = require('../../lib/events-ha-node');

module.exports = function (RED) {
    const nodeOptions = {
        config: {
            entity_id: (nodeDef) => (nodeDef.entity_id || '').trim(),
            updateinterval: (nodeDef) =>
                !isNaN(nodeDef.updateinterval)
                    ? Number(nodeDef.updateinterval)
                    : 60,
            updateIntervalUnits: {},
            outputinitially: {},
            outputonchanged: {},
            state_type: (nodeDef) => nodeDef.state_type || 'str',
            halt_if: {},
            halt_if_type: (nodeDef) => nodeDef.halt_if_type || 'str',
            halt_if_compare: (nodeDef) => nodeDef.halt_if_compare || 'is',
        },
    };

    class TimeSinceStateNode extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

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
                this.addEventClientListener(
                    `ha_events:state_changed:${this.nodeConfig.entity_id}`,
                    this.onTimer.bind(this)
                );
            }

            if (this.nodeConfig.outputinitially) {
                if (this.isHomeAssistantRunning) {
                    this.onTimer();
                } else {
                    this.addEventClientListener(
                        'ha_client:initial_connection_ready',
                        this.onTimer.bind(this)
                    );
                }
            }
        }

        onClose(removed) {
            super.onClose(removed);
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }

        onTimer(triggered = false) {
            if (!this.isHomeAssistantRunning || this.isEnabled === false) {
                return;
            }

            const pollState = this.nodeConfig.server.homeAssistant.getStates(
                this.nodeConfig.entity_id
            );
            if (!pollState) {
                this.error(
                    `could not find state with entity_id "${this.nodeConfig.entity_id}"`,
                    {}
                );
                this.status({
                    fill: 'red',
                    shape: 'ring',
                    text: `no state found for ${this.nodeConfig.entity_id}`,
                });
                return;
            }

            const dateChanged = this.calculateTimeSinceChanged(pollState);
            if (!dateChanged) {
                this.error(
                    `could not calculate time since changed for entity_id "${this.nodeConfig.entity_id}"`,
                    {}
                );
                return;
            }
            pollState.timeSinceChanged = ta.ago(dateChanged);
            pollState.timeSinceChangedMs = Date.now() - dateChanged.getTime();

            // Convert and save original state if needed
            this.castState(pollState, this.nodeConfig.state_type);

            const msg = {
                topic: this.nodeConfig.entity_id,
                payload: pollState.state,
                data: pollState,
            };

            let isIfState;
            try {
                isIfState = this.getComparatorResult(
                    this.nodeConfig.halt_if_compare,
                    this.nodeConfig.halt_if,
                    pollState.state,
                    this.nodeConfig.halt_if_type,
                    {
                        entity: pollState,
                    }
                );
            } catch (e) {
                this.setStatusFailed('Error');
                this.node.error(e.message, {});
                return;
            }

            const statusMessage = `${pollState.state}${
                triggered === true ? ` (triggered)` : ''
            }`;

            // Handle version 0 'halt if' outputs
            if (this.nodeConfig.version < 1) {
                if (this.nodeConfig.halt_if && isIfState) {
                    this.setStatusFailed(statusMessage);
                    this.send([null, msg]);
                    return;
                }
                this.setStatusSuccess(statusMessage);
                this.send([msg, null]);
                return;
            }

            // Check 'if state' and send to correct output
            if (this.nodeConfig.halt_if && !isIfState) {
                this.setStatusFailed(statusMessage);
                this.send([null, msg]);
                return;
            }

            this.setStatusSuccess(statusMessage);
            this.send([msg, null]);
        }

        getNodeEntityId() {
            return this.nodeConfig.entity_id;
        }

        triggerNode(eventMessage) {
            this.onTimer(true);
        }

        calculateTimeSinceChanged(entityState) {
            const entityLastChanged = entityState.last_changed;
            return new Date(entityLastChanged);
        }
    }
    RED.nodes.registerType('poll-state', TimeSinceStateNode);
};
