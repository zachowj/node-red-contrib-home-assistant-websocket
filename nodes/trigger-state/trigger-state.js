/* eslint-disable camelcase */
const EventsNode = require('../../lib/events-node');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            entityid: {},
            entityidfilter: nodeDef => {
                if (!nodeDef.entityid) return undefined;

                if (nodeDef.entityidfiltertype === 'substring')
                    return nodeDef.entityid.split(',').map(f => f.trim());
                if (nodeDef.entityidfiltertype === 'regex')
                    return new RegExp(nodeDef.entityid);
                return nodeDef.entityid;
            },
            entityidfiltertype: {},
            isenabled: {},
            constraints: {},
            customoutputs: {},
            outputinitially: {}
        }
    };

    class TriggerState extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            this.addEventClientListener({
                event: 'ha_events:state_changed',
                handler: this.onEntityStateChanged.bind(this)
            });

            this.NUM_DEFAULT_MESSAGES = 2;
            this.messageTimers = {};

            this.loadPersistedData();

            if (this.nodeConfig.outputinitially) {
                this.addEventClientListener({
                    event: 'ha_events:states_loaded',
                    handler: this.onDeploy.bind(this)
                });
            }
        }

        onInput({ message }) {
            if (message === 'enable' || message.payload === 'enable') {
                this.isenabled = true;
                this.saveNodeData('isenabled', true);
                this.updateConnectionStatus();
                return;
            }
            if (message === 'disable' || message.payload === 'disable') {
                this.isenabled = false;
                this.saveNodeData('isenabled', false);
                this.updateConnectionStatus();
                return;
            }

            const { entity_id, new_state, old_state } = message.payload;
            if (entity_id && new_state && old_state) {
                const evt = {
                    event_type: 'state_changed',
                    entity_id: entity_id,
                    event: message.payload
                };

                this.onEntityStateChanged(evt);
            }
        }

        async onDeploy() {
            const entityState = await this.nodeConfig.server.homeAssistant.getStates(
                this.nodeConfig.entityid
            );

            let eventMessage = {
                event_type: 'state_changed',
                entity_id: this.nodeConfig.entityid,
                event: {
                    entity_id: this.nodeConfig.entityid,
                    old_state: entityState,
                    new_state: entityState
                }
            };

            this.onEntityStateChanged(eventMessage);
        }

        async onEntityStateChanged(eventMessage) {
            if (this.isenabled === false) {
                this.debugToClient(
                    'incoming: node is currently disabled, ignoring received event'
                );
                return;
            }
            if (!this.shouldIncludeEvent(eventMessage.entity_id)) {
                return;
            }

            try {
                const constraintComparatorResults = await this.getConstraintComparatorResults(
                    this.nodeConfig.constraints,
                    eventMessage
                );
                const state = eventMessage.event.new_state.state;
                let outputs = this.getDefaultMessageOutputs(
                    constraintComparatorResults,
                    eventMessage
                );
                let status = {
                    fill: 'green',
                    shape: 'dot',
                    text: `${state} at: ${this.getPrettyDate()}`
                };

                // If a constraint comparator failed we're done, also if no custom outputs to look at
                if (
                    constraintComparatorResults.failed.length ||
                    !this.nodeConfig.customoutputs.length
                ) {
                    if (constraintComparatorResults.failed.length) {
                        status = {
                            fill: 'red',
                            shape: 'ring',
                            text: `${state} at: ${this.getPrettyDate()}`
                        };
                    }
                    this.debugToClient(
                        'done processing sending messages: ',
                        outputs
                    );
                    this.status(status);
                    return this.send(outputs);
                }

                const customOutputsComparatorResults = this.getCustomOutputsComparatorResults(
                    this.nodeConfig.customoutputs,
                    eventMessage
                );
                const customOutputMessages = customOutputsComparatorResults.map(
                    r => r.message
                );

                outputs = outputs.concat(customOutputMessages);
                this.debugToClient(
                    'done processing sending messages: ',
                    outputs
                );
                this.status(status);
                this.send(outputs);
            } catch (e) {
                this.error(e);
            }
        }

        async getConstraintComparatorResults(constraints, eventMessage) {
            const comparatorResults = [];

            // Check constraints
            for (let constraint of constraints) {
                const {
                    comparatorType,
                    comparatorValue,
                    comparatorValueDatatype,
                    propertyValue
                } = constraint;
                const constraintTarget = await this.getConstraintTargetData(
                    constraint,
                    eventMessage.event
                );
                const actualValue = this.utils.reach(
                    constraint.propertyValue,
                    constraintTarget.state
                );
                const comparatorResult = this.getComparatorResult(
                    comparatorType,
                    comparatorValue,
                    actualValue,
                    comparatorValueDatatype
                );

                if (comparatorResult === false) {
                    this.debugToClient(
                        `constraint comparator: failed entity "${
                            constraintTarget.entityid
                        }" property "${propertyValue}" with value ${actualValue} failed "${comparatorType}" check against (${comparatorValueDatatype}) ${comparatorValue}`
                    ); // eslint-disable-line
                }

                comparatorResults.push({
                    constraint,
                    constraintTarget,
                    actualValue,
                    comparatorResult
                });
            }
            const failedComparators = comparatorResults.filter(
                res => !res.comparatorResult
            );
            return {
                all: comparatorResults || [],
                failed: failedComparators || []
            };
        }

        getDefaultMessageOutputs(comparatorResults, eventMessage) {
            const { entity_id, event } = eventMessage;

            const msg = {
                topic: entity_id,
                payload: event.new_state.state,
                data: eventMessage
            };
            let outputs;

            if (comparatorResults.failed.length) {
                this.debugToClient(
                    'constraint comparator: one more more comparators failed to match constraints, message will send on the failed output'
                );

                msg.failedComparators = comparatorResults.failed;
                outputs = [null, msg];
            } else {
                outputs = [msg, null];
            }
            return outputs;
        }

        getCustomOutputsComparatorResults(outputs, eventMessage) {
            return outputs.reduce((acc, output, reduceIndex) => {
                let result = {
                    output,
                    comparatorMatched: true,
                    actualValue: null,
                    message: null
                };

                if (output.comparatorPropertyType !== 'always') {
                    result.actualValue = this.utils.reach(
                        output.comparatorPropertyValue,
                        eventMessage.event
                    );
                    result.comparatorMatched = this.getComparatorResult(
                        output.comparatorType,
                        output.comparatorValue,
                        result.actualValue,
                        output.comparatorValueDatatype
                    );
                }
                result.message = this.getOutputMessage(result, eventMessage);
                acc.push(result);
                return acc;
            }, []);
        }

        async getConstraintTargetData(constraint, triggerEvent) {
            let targetData = { entityid: null, state: null };
            try {
                const isTargetThisEntity =
                    constraint.targetType === 'this_entity';
                targetData.entityid = isTargetThisEntity
                    ? this.nodeConfig.entityid
                    : constraint.targetValue;

                // TODO: Non 'self' targets state is just new_state of an incoming event, wrap to hack around the fact
                // NOTE: UI needs changing to handle this there, and also to hide "previous state" if target is not self
                if (isTargetThisEntity) {
                    targetData.state = triggerEvent;
                } else {
                    const state = await this.nodeConfig.server.homeAssistant.getStates(
                        targetData.entityid
                    );
                    targetData.state = {
                        new_state: state
                    };
                }
            } catch (e) {
                this.debug(
                    'Error during trigger:state comparator evalutation: ',
                    e.stack
                );
                throw e;
            }

            return targetData;
        }

        /* eslint-disable indent */
        getCastValue(datatype, value) {
            if (!datatype) return value;

            switch (datatype) {
                case 'num':
                    return parseFloat(value);
                case 'str':
                    return value + '';
                case 'bool':
                    return !!value;
                case 're':
                    return new RegExp(value);
                case 'list':
                    return value.split(',');
                default:
                    return value;
            }
        }

        /* eslint-disable indent */
        getComparatorResult(
            comparatorType,
            comparatorValue,
            actualValue,
            comparatorValueDatatype
        ) {
            const cValue = this.getCastValue(
                comparatorValueDatatype,
                comparatorValue
            );

            switch (comparatorType) {
                case 'is':
                case 'is_not':
                    // Datatype might be num, bool, str, re (regular expression)
                    const isMatch =
                        comparatorValueDatatype === 're'
                            ? cValue.test(actualValue)
                            : cValue === actualValue;
                    return comparatorType === 'is' ? isMatch : !isMatch;
                case 'includes':
                case 'does_not_include':
                    const isIncluded = cValue.includes(actualValue);
                    return comparatorType === 'includes'
                        ? isIncluded
                        : !isIncluded;
                case 'greater_than': // here for backwards compatibility
                case '>':
                    return actualValue > cValue;
                case '>=':
                    return actualValue >= cValue;
                case 'less_than': // here for backwards compatibility
                case '<':
                    return actualValue < cValue;
                case '<=':
                    return actualValue <= cValue;
            }
        }

        getOutputMessage(
            { output, comparatorMatched, actualValue },
            eventMessage
        ) {
            // If comparator did not match
            if (!comparatorMatched) {
                this.debugToClient(
                    `output comparator failed: property "${
                        output.comparatorPropertyValue
                    }" with value ${actualValue} failed "${
                        output.comparatorType
                    }" check against ${output.comparatorValue}`
                ); // eslint-disable-line
                return null;
            }

            if (output.messageType === 'default') {
                return {
                    topic: eventMessage.entity_id,
                    payload: eventMessage.event.new_state.state,
                    data: eventMessage
                };
            }

            try {
                return JSON.parse(output.messageValue);
            } catch (e) {
                return output.messageValue;
            }
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

        async onClose(removed) {
            super.onClose();
            if (removed) {
                await this.removeNodeData();
            }
        }

        shouldIncludeEvent(entityId) {
            if (!this.nodeConfig.entityidfilter) return true;
            const filter = this.nodeConfig.entityidfilter;
            const type = this.nodeConfig.entityidfiltertype;

            if (type === 'substring') {
                const found = this.nodeConfig.entityidfilter.filter(
                    filterStr => entityId.indexOf(filterStr) >= 0
                );
                return found.length > 0;
            }

            if (type === 'regex') {
                return filter.test(entityId);
            }

            return filter === entityId;
        }
    }

    RED.nodes.registerType('trigger-state', TriggerState);
};
