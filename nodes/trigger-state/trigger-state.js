const EventsNode = require('../../lib/events-node');

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
                    const state = await this.nodeConfig.server.api.getStates(targetData.entityid);
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
                            this.debug(`Failed Result: "${res.constraintTarget.entityid}" had actual value of "${res.actualValue}" which failed an "${res.constraint.comparatorType}" check looking for expected value "${res.constraint.comparatorValue}"`);
                            return res;
                        });
                    msg.failedConstraints = failedConstraints;
                    outputs = [null, msg];
                } else {
                    outputs = [msg, null];
                }

                if (!this.nodeConfig.customoutputs || !this.nodeConfig.customoutputs.length) return this.send(outputs);

                // Map output to matched customoutputs
                const customoutputMsgs = this.nodeConfig.customoutputs.reduce((acc, output) => {
                    const actualValue = event.new_state.state;
                    const comparatorMatched = this.getComparatorResult(output.comparatorType, output.comparatorValue, actualValue);
                    (comparatorMatched) ? acc.push(msg) : acc.push(null);
                    return acc;
                }, []);
                outputs = outputs.concat(customoutputMsgs);

                this.send(outputs);
            } catch (e) {
                this.error(e);
            }
        }
    }

    RED.nodes.registerType('trigger-state', TriggerState);
};
