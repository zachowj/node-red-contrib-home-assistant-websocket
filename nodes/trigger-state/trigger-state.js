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
            constraints:   {},
            customoutputs: {}
        }
    };

    class TriggerState extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            const eventTopic = `ha_events:state_changed:${this.nodeConfig.entityid}`;
            this.addEventClientListener({ event: eventTopic, handler: this.onEntityStateChanged.bind(this) });
            this.NUM_DEFAULT_MESSAGES = 2;
            this.messageTimers = {};
        }
        onClose(removed) {
            super.onClose();
            // TODO: test this
            if (removed) {
                this.debug('removing all message timers onClose and node was removed');
                Object.keys(this.messageTimers).forEach(k => {
                    if (this.messageTimers[k]) clearTimeout(this.messageTimers[k]);
                    this.messageTimers[k] = null;
                });
            }
        }

        onInput({ message })  {
            const p = message.payload;
            if (p.entity_id && p.new_state && p.old_state) {
                const evt = {
                    event_type: 'state_changed',
                    entity_id:  p.entity_id,
                    event:      p
                };
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
                        new_state: state[targetData.entityid]
                    };
                }
            } catch (e) {
                this.debug('Error during trigger:state comparator evalutation: ', e.stack);
                throw e;
            }

            return targetData;
        }

        /* eslint-disable indent */
        getComparatorResult(comparatorType, comparatorValue, actualValue) {
            switch (comparatorType) {
                case 'is':
                    return comparatorValue === actualValue;
                case 'is_not':
                    return comparatorValue !== actualValue;
                case 'greater_than':
                    return comparatorValue > actualValue;
                case 'less_than':
                    return comparatorValue < actualValue;
                case 'includes':
                case 'does_not_include':
                    const filterResults = comparatorValue.split(',').filter(cvalue => (cvalue === actualValue));
                    return (comparatorType === 'includes')
                        ? filterResults.length > 0
                        : filterResults.length < 1;
            }
        }

        async onEntityStateChanged (evt) {
            try {
                const { entity_id, event } = evt;
                const { nodeConfig } = this;

                // The event listener will only fire off correct entity events, this is for testing with incoming message
                if (entity_id !== this.nodeConfig.entityid) return;

                const allComparatorResults = [];
                let comparatorsAllMatches = true;

                // Check constraints
                for (let constraint of nodeConfig.constraints) {
                    const constraintTarget = await this.getConstraintTargetData(constraint, event);
                    const actualValue      = this.utils.reach(constraint.propertyValue, constraintTarget.state);
                    const comparatorResult = this.getComparatorResult(constraint.comparatorType, constraint.comparatorValue, actualValue);

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
                    this.debug(`one more more comparators failed to match constraints, flow halted as a result, failed results below: `);

                    const failedConstraints = allComparatorResults.filter(res => !res.comparatorResult)
                        .map(res => {
                            this.debug(`Failed Result: "${res.constraintTarget.entityid}" had value of "${res.actualValue}" which failed an "${res.constraint.comparatorType}" check against expected value "${res.constraint.comparatorValue}"`);
                            return res;
                        });
                    msg.failedConstraints = failedConstraints;
                    outputs = [null, msg];
                } else {
                    outputs = [msg, null];
                }

                if (!this.nodeConfig.customoutputs.length) return this.send(outputs);

                // Map output to matched customoutputs
                const customoutputMsgs = this.nodeConfig.customoutputs.reduce((acc, output, reduceIndex) => {
                    let comparatorMatched = true;

                    if (output.comparatorPropertyType !== 'always') {
                        const actualValue = this.utils.reach(output.comparatorPropertyValue, event);
                        comparatorMatched = this.getComparatorResult(output.comparatorType, output.comparatorValue, actualValue);
                    }

                    let message = (output.messageType === 'default') ? msg : output.messageValue;

                    // If comparator did not matched no need to go further
                    if (!comparatorMatched) {
                        this.debug('Skipping message, output comparator failed');
                        acc.push(null);
                        return acc;
                    }

                    // If comparator matched and send immediate is set just assign message to output
                    if (output.timerType === 'immediate') {
                        acc.push(message);
                        this.debug('Adding immediate message');
                        return acc;
                    }

                    // If already timer scheduler for this output then clear it for re-setting
                    if (this.messageTimers[output.outputId]) {
                        this.debug('Found already scheduled message, extending the message timeout');
                        clearTimeout(this.messageTimers[output.outputId]);
                    }

                    // Get the timer ms value
                    const timerDelayMs = output.timerValue * TIMER_MULTIPLIERS[output.timerUnit];

                    // Create the message to send, all outputs leading to this one with null (dont send) values
                    const customOutputIndexWithDefaults = reduceIndex + this.NUM_DEFAULT_MESSAGES;
                    const scheduledMessage = (new Array(customOutputIndexWithDefaults + 1)).fill(null);
                    scheduledMessage[customOutputIndexWithDefaults] = message;
                    this.debug('Created scheduledMessage: ', scheduledMessage);

                    this.messageTimers[output.outputId] = setTimeout(() => {
                        this.debug('Sending delayed message', scheduledMessage);
                        this.send(scheduledMessage);
                        delete this.messageTimers[output.outputId];
                    }, timerDelayMs);

                    // Since the message was scheduled push null val to current message output list
                    acc.push(null);
                    return acc;
                }, []);

                outputs = outputs.concat(customoutputMsgs);
                this.debug('Sending default output messages and any matched custom outputs(if any)');
                this.send(outputs);
            } catch (e) {
                this.error(e);
            }
        }
    }

    RED.nodes.registerType('trigger-state', TriggerState);
};
