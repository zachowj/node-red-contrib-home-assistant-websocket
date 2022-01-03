const ta = require('time-ago');

const EventsHaNode = require('../EventsHaNode');
const {
    getTimeInMilliseconds,
    getEntitiesFromJsonata,
} = require('../../helpers/utils');
const { TYPEDINPUT_JSONATA } = require('../../const');

const nodeOptions = {
    config: {
        entity_id: (nodeDef) => (nodeDef.entity_id || '').trim(),
        updateinterval: {},
        updateIntervalType: {},
        updateIntervalUnits: {},
        outputinitially: {},
        outputonchanged: {},
        state_type: {},
        halt_if: {},
        halt_if_type: {},
        halt_if_compare: {},
    },
};

class PollState extends EventsHaNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });

        if (!this.nodeConfig.entity_id) {
            throw new Error('Entity Id is required');
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

        if (this.isHomeAssistantRunning) {
            this.onIntervalUpdate();
        }
        this.addEventClientListener(
            'ha_client:ready',
            this.onIntervalUpdate.bind(this)
        );
        if (
            this.nodeConfig.updateIntervalType === TYPEDINPUT_JSONATA &&
            this.nodeConfig.updateinterval.length > 12
        ) {
            const ids = getEntitiesFromJsonata(this.nodeConfig.updateinterval);
            ids.forEach((id) => {
                this.addEventClientListener(
                    `ha_events:state_changed:${id}`,
                    this.onIntervalUpdate.bind(this)
                );
            });
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

        const pollState = this.homeAssistant.getStates(
            this.nodeConfig.entity_id
        );
        if (!pollState) {
            this.node.error(
                `could not find state with entity_id "${this.nodeConfig.entity_id}"`,
                {}
            );
            this.status.setText(
                `no state found for ${this.nodeConfig.entity_id}`
            );
            return;
        }

        const dateChanged = this.calculateTimeSinceChanged(pollState);
        if (!dateChanged) {
            this.node.error(
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
            this.status.setFailed('Error');
            this.node.error(e.message, {});
            return;
        }

        const statusMessage = `${pollState.state}${
            triggered === true ? ` (triggered)` : ''
        }`;

        // Check 'if state' and send to correct output
        if (this.nodeConfig.halt_if && !isIfState) {
            this.status.setFailed(statusMessage);
            this.send([null, msg]);
            return;
        }

        this.status.setSuccess(statusMessage);
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

    getInterval() {
        let interval = this.nodeConfig.updateinterval || '0';
        if (this.nodeConfig.updateIntervalType === TYPEDINPUT_JSONATA) {
            try {
                interval = this.evaluateJSONata(interval);
            } catch (e) {
                this.node.error(
                    this.RED._('poll-state.errors.jsonata_error', {
                        message: e.message,
                    })
                );
                throw new Error('error');
            }
        }

        const intervalMs = getTimeInMilliseconds(
            interval,
            this.nodeConfig.updateIntervalUnits
        );
        if (isNaN(intervalMs)) {
            this.node.error(
                this.RED._('poll-state.errors.offset_nan', { interval })
            );
            throw new Error(this.RED._('poll-state.status.error'));
        }

        return Number(intervalMs);
    }

    onIntervalUpdate() {
        const interval = this.getInterval();
        // create new timer if interval changed
        if (interval !== this.updateinterval) {
            clearInterval(this.timer);
            this.updateinterval = interval;
            this.timer = setInterval(
                this.onTimer.bind(this),
                this.updateinterval
            );
        }
    }
}

module.exports = PollState;
