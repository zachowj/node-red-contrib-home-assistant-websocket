const EventsNode = require('../../lib/events-node');

const TIMER_MULTIPLIERS = {
    milliseconds: 1,
    seconds:      1000,
    minutes:      60000,
    hours:        3600000
};

module.exports = function(RED) {
    const nodeOptions = {
        debug:  true,
        config: {
            entityid:      {},
            isenabled:     {},
            constraints:   {},
            customoutputs: {}
        }
    };

    class TriggerState extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            const eventTopic = this.eventTopic = `ha_events:state_changed:${this.nodeConfig.entityid}`;
            this.addEventClientListener({ event: eventTopic, handler: this.onEntityStateChanged.bind(this) });
            this.NUM_DEFAULT_MESSAGES = 2;
            this.messageTimers = {};

            this.loadPersistedData();
        }
        async loadPersistedData() {
            try {
                const data = await this.getNodeData();
                if (data && data.hasOwnProperty('isenabled')) {
                    this.isenabled = data.isenabled;
                    this.updateConnectionStatus();
                }
            } catch (e) {
                this.error(e.message);
            }
        }
        updateConnectionStatus() {
            if (!this.messageTimers) return super.updateConnectionStatus();
            const msgKeys = Object.keys(this.messageTimers);
            const additionalText = msgKeys.length > 0 ? `(${msgKeys.length} msgs scheduled)` : null;
            super.updateConnectionStatus(additionalText);
        }
        clearAllTimers() {
            Object.keys(this.messageTimers).forEach(k => {
                if (this.messageTimers[k]) clearTimeout(this.messageTimers[k]);
                this.messageTimers[k] = null;
            });
        }
        onHaEventsOpen()  {
            super.onHaEventsOpen();
            this.debugToClient(`connected, listening for ha events topic: ${this.eventTopic}`);
        }
        async onClose(removed) {
            super.onClose();
            this.clearAllTimers();
            if (removed) {
                await this.removeNodeData();
            }
        }
        onInput({ message })  {
            if (message === 'reset' || message.payload === 'reset') {
                this.debugToClient('canceling all timers due to incoming "reset" message');
                this.clearAllTimers();
                return;
            }
            // NOTE: Need to look at way to update node config via serverside, doesn't look like it's supported at all.
            if (message === 'enable' || message.payload === 'enable') {
                this.debugToClient('node set to enabled by incoming "enable" message');
                this.isenabled = true;
                this.saveNodeData('isenabled', true);
                this.updateConnectionStatus();
                return;
            }
            if (message === 'disable' || message.payload === 'disable') {
                this.debugToClient('node set to disabled by incoming "disable" message');
                this.isenabled = false;
                this.clearAllTimers();
                this.saveNodeData('isenabled', false);
                this.updateConnectionStatus();
                return;
            }

            const p = message.payload;

            if (p.entity_id && p.new_state && p.old_state) {
                const evt = {
                    event_type: 'state_changed',
                    entity_id:  p.entity_id,
                    event:      p
                };

                this.debugToClient('injecting "fake" ha event from input msg received: ', evt);
                this.onEntityStateChanged(evt);
            }
        }

        async getConstraintTargetData(constraint, triggerEvent) {
            let targetData = { entityid: null, state: null };

            try {
                const isTargetThisEntity = constraint.targetType === 'this_entity';
                targetData.entityid = (isTargetThisEntity) ? this.nodeConfig.entityid : constraint.targetValue;

                // TODO: Non 'self' targets state is just new_state of an incoming event, wrap to hack around the fact
                // NOTE: UI needs changing to handle this there, and also to hide "previous state" if target is not self
                if (isTargetThisEntity) {
                    targetData.state = triggerEvent;
                } else {
                    const state = await this.nodeConfig.server.homeAssistant.getStates(targetData.entityid);
                    targetData.state = {
                        new_state: state
                    };
                }
            } catch (e) {
                this.debug('Error during trigger:state comparator evalutation: ', e.stack);
                throw e;
            }

            return targetData;
        }

        /* eslint-disable indent */
        getCastValue(datatype, value) {
            if (!datatype) return value;

            switch (datatype) {
                case 'num':  return parseFloat(value);
                case 'str':  return value + '';
                case 'bool': return !!value;
                case 're':   return new RegExp(value);
                case 'list': return value.split(',');
                default: return value;
            }
        }

        /* eslint-disable indent */
        getComparatorResult(comparatorType, comparatorValue, actualValue, comparatorValueDatatype) {
            const cValue = this.getCastValue(comparatorValueDatatype, comparatorValue);

            switch (comparatorType) {
                case 'is':
                case 'is_not':
                    // Datatype might be num, bool, str, re (regular expression)
                    const isMatch = (comparatorValueDatatype === 're') ? cValue.test(actualValue) : (cValue === actualValue);
                    return (comparatorType === 'is') ? isMatch : !isMatch;
                case 'includes':
                case 'does_not_include':
                    const isIncluded = cValue.includes(actualValue);
                    return (comparatorType === 'includes') ? isIncluded : !isIncluded;
                case 'greater_than':
                    return actualValue > cValue;
                case 'less_than':
                    return actualValue < cValue;
            }
        }

        async onEntityStateChanged (evt) {
            if (this.isenabled === false) {
                this.debugToClient('node is currently disabled, ignoring received event: ', evt);
                return;
            }

            this.debugToClient('received state_changed event', evt);

            try {
                const { entity_id, event } = evt;
                const { nodeConfig } = this;

                // The event listener will only fire off correct entity events, this is for testing with incoming message
                if (entity_id !== this.nodeConfig.entityid) {
                    this.debugToClient(`incoming entity_id(${entity_id})  does not match configured entity_id: (${this.nodeConfig.entityid}), skipping event processing`);
                    return;
                }

                const allComparatorResults = [];
                let comparatorsAllMatches = true;

                // Check constraints
                for (let constraint of nodeConfig.constraints) {
                    const constraintTarget = await this.getConstraintTargetData(constraint, event);
                    const actualValue      = this.utils.reach(constraint.propertyValue, constraintTarget.state);
                    const comparatorResult = this.getComparatorResult(constraint.comparatorType, constraint.comparatorValue, actualValue, constraint.comparatorValueDatatype);

                    if (!comparatorResult) {
                        this.debugToClient(`constraint comparator failed: entity "${constraintTarget.entityid}" property "${constraint.propertyValue}" with value ${actualValue} failed "${constraint.comparatorType}" check against (${constraint.comparatorValueDatatype}) ${constraint.comparatorValue}`);
                    }

                    // If all previous comparators were true and this comparator is true then all matched so far
                    comparatorsAllMatches = comparatorsAllMatches && comparatorResult;

                    allComparatorResults.push({ constraint, constraintTarget, actualValue, comparatorResult });
                }

                const msg = {
                    topic:   entity_id,
                    payload: event.new_state.state,
                    data:    event
                };
                let outputs;

                if (!comparatorsAllMatches) {
                    this.debugToClient('one more more comparators failed to match constraints, message will send on failed output');

                    const failedConstraints = allComparatorResults.filter(res => !res.comparatorResult);
                    msg.failedConstraints = failedConstraints;
                    outputs = [null, msg];
                } else {
                    this.debugToClient('all (if any) constraints passed checks');
                    outputs = [msg, null];
                }

                // If constraints failed and we have no custom outputs then we're done
                if (!comparatorsAllMatches && !this.nodeConfig.customoutputs.length) {
                    this.debugToClient('done processing sending messages: ', outputs);
                    return this.send(outputs);
                }

                // Map output to matched customoutputs
                const customoutputMsgs = this.nodeConfig.customoutputs.reduce((acc, output, reduceIndex) => {
                    let comparatorMatched = true;
                    let actualValue;
                    if (output.comparatorPropertyType !== 'always') {
                        actualValue = this.utils.reach(output.comparatorPropertyValue, event);
                        comparatorMatched = this.getComparatorResult(output.comparatorType, output.comparatorValue, actualValue, output.comparatorValueDatatype);
                    }

                    let message = (output.messageType === 'default') ? msg : output.messageValue;

                    // If comparator did not matched no need to go further
                    if (!comparatorMatched) {
                        this.debugToClient(`output comparator failed: property "${output.comparatorPropertyValue}" with value ${actualValue} failed "${output.comparatorType}" check against (${output.comparatorValueDatatype}) ${output.comparatorValue}`);
                        acc.push(null);
                        return acc;
                    }

                    // If comparator matched and send immediate is set just assign message to output
                    if (output.timerType === 'immediate') {
                        acc.push(message);
                        this.debugToClient(`output ${output.outputId}: adding "immediate" send of message: `);
                        this.debugToClient(message);
                        return acc;
                    }

                    // Get the timer ms value
                    const timerDelayMs = output.timerValue * TIMER_MULTIPLIERS[output.timerUnit];

                    // If already timer scheduler for this output then clear it for re-setting
                    if (this.messageTimers[output.outputId]) {
                        this.debugToClient(`output ${output.outputId}: found already scheduled message, clearing timer to reschedule`);
                        clearTimeout(this.messageTimers[output.outputId]);
                    }

                    // Create the message to send, all outputs leading to this one with null (dont send) values
                    const customOutputIndexWithDefaults = reduceIndex + this.NUM_DEFAULT_MESSAGES;
                    const scheduledMessage = (new Array(customOutputIndexWithDefaults + 1)).fill(null);
                    scheduledMessage[customOutputIndexWithDefaults] = message;
                    this.debugToClient(`output ${output.outputId}: scheduled message for send after ${timerDelayMs}ms, message contents: `, message);

                    this.messageTimers[output.outputId] = setTimeout(() => {
                        this.debugToClient(`output ${output.outputId}: sending delayed message: `, scheduledMessage);
                        this.send(scheduledMessage);
                        delete this.messageTimers[output.outputId];
                        this.updateConnectionStatus();
                    }, timerDelayMs);

                    // Since the message was scheduled push null val to current message output list
                    acc.push(null);
                    this.updateConnectionStatus();
                    return acc;
                }, []);

                outputs = outputs.concat(customoutputMsgs);
                this.debugToClient('done processing sending messages: ', outputs);
                this.send(outputs);
            } catch (e) {
                this.error(e);
            }
        }
    }

    RED.nodes.registerType('trigger-state', TriggerState);
};
