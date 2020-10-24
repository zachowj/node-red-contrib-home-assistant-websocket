/* eslint-disable camelcase */
const cloneDeep = require('lodash.clonedeep');
const selectn = require('selectn');

const EventsHaNode = require('../../lib/events-ha-node');
const RenderTemplate = require('../../lib/mustache-context');
const { shouldIncludeEvent } = require('../../lib/utils');

module.exports = function (RED) {
    const nodeOptions = {
        debug: true,
        config: {
            entityid: {},
            entityidfiltertype: {},
            constraints: {},
            customoutputs: {},
            outputinitially: {},
            state_type: { value: 'str' },
        },
    };

    class TriggerState extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            let eventTopic = 'ha_events:state_changed';

            if (this.nodeConfig.entityidfiltertype === 'exact') {
                eventTopic = this.eventTopic = `ha_events:state_changed:${this.nodeConfig.entityid}`;
            }

            this.addEventClientListener(
                eventTopic,
                this.onEntityStateChanged.bind(this)
            );

            this.NUM_DEFAULT_MESSAGES = 2;

            if (this.nodeConfig.outputinitially) {
                // Here for when the node is deploy without the server config being deployed
                if (this.isHomeAssistantRunning) {
                    this.onDeploy();
                } else {
                    this.addEventClientListener(
                        'ha_client:initial_connection_ready',
                        this.onStatesLoaded.bind(this)
                    );
                }
            }
        }

        onInput({ message }) {
            if (message === 'enable' || message.payload === 'enable') {
                this.isEnabled = true;
                this.saveNodeData('isEnabled', true);
                this.updateConnectionStatus();
                this.updateHomeAssistant();
                return;
            }
            if (message === 'disable' || message.payload === 'disable') {
                this.isEnabled = false;
                this.saveNodeData('isEnabled', false);
                this.updateConnectionStatus();
                this.updateHomeAssistant();
                return;
            }

            const { entity_id, new_state, old_state } = message.payload;
            if (entity_id && new_state && old_state) {
                const evt = {
                    event_type: 'state_changed',
                    entity_id: entity_id,
                    event: message.payload,
                };

                this.onEntityStateChanged(evt);
            }
        }

        onDeploy() {
            const entities = this.nodeConfig.server.homeAssistant.getStates();
            this.onStatesLoaded(entities);
        }

        onStatesLoaded(entities) {
            for (const entityId in entities) {
                const eventMessage = {
                    event_type: 'state_changed',
                    entity_id: entityId,
                    event: {
                        entity_id: entityId,
                        old_state: entities[entityId],
                        new_state: entities[entityId],
                    },
                };

                this.onEntityStateChanged(eventMessage);
            }
        }

        onEntityStateChanged(evt) {
            if (this.isEnabled === false) {
                this.debugToClient(
                    'incoming: node is currently disabled, ignoring received event'
                );
                return;
            }

            if (
                !selectn('event.new_state', evt) ||
                !this.isHomeAssistantRunning
            ) {
                return;
            }

            const eventMessage = cloneDeep(evt);

            if (
                !shouldIncludeEvent(
                    eventMessage.entity_id,
                    this.nodeConfig.entityid,
                    this.nodeConfig.entityidfiltertype
                )
            ) {
                return;
            }

            // Convert and save original state if needed
            this.castState(
                eventMessage.event.old_state,
                this.nodeConfig.state_type
            );
            this.castState(
                eventMessage.event.new_state,
                this.nodeConfig.state_type
            );

            try {
                eventMessage.event.new_state.timeSinceChangedMs =
                    Date.now() -
                    new Date(
                        eventMessage.event.new_state.last_changed
                    ).getTime();

                const constraintComparatorResults = this.getConstraintComparatorResults(
                    this.nodeConfig.constraints,
                    eventMessage
                );
                const statusText = `${eventMessage.event.new_state.state}${
                    eventMessage.event_type === 'triggered'
                        ? ' (triggered)'
                        : ''
                } at: ${this.getPrettyDate()}`;

                let outputs = this.getDefaultMessageOutputs(
                    constraintComparatorResults,
                    eventMessage
                );
                let status = {
                    fill: 'green',
                    shape: 'dot',
                    text: statusText,
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
                            text: statusText,
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
                    (r) => r.message
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

        getNodeEntityId() {
            return (
                this.nodeConfig.entityidfiltertype === 'exact' &&
                this.nodeConfig.entityid
            );
        }

        triggerNode(eventMessage) {
            this.onEntityStateChanged(eventMessage);
        }

        getConstraintComparatorResults(constraints, eventMessage) {
            const comparatorResults = [];

            // Check constraints
            for (const constraint of constraints) {
                const {
                    comparatorType,
                    comparatorValue,
                    comparatorValueDatatype,
                    propertyValue,
                } = constraint;
                const constraintTarget = this.getConstraintTargetData(
                    constraint,
                    eventMessage.event
                );

                const actualValue = selectn(
                    constraint.propertyValue,
                    constraintTarget.state
                );

                const comparatorResult = this.getComparatorResult(
                    comparatorType,
                    comparatorValue,
                    actualValue,
                    comparatorValueDatatype,
                    {
                        entity: eventMessage.event.new_state,
                        prevEntity: eventMessage.event.old_state,
                    }
                );

                if (comparatorResult === false) {
                    this.debugToClient(
                        `constraint comparator: failed entity "${constraintTarget.entityid}" property "${propertyValue}" with value ${actualValue} failed "${comparatorType}" check against (${comparatorValueDatatype}) ${comparatorValue}`
                    );
                }

                comparatorResults.push({
                    constraint,
                    constraintTarget,
                    actualValue,
                    comparatorResult,
                });
            }
            const failedComparators = comparatorResults.filter(
                (res) => !res.comparatorResult
            );
            return {
                all: comparatorResults || [],
                failed: failedComparators || [],
            };
        }

        getDefaultMessageOutputs(comparatorResults, eventMessage) {
            const { entity_id, event } = eventMessage;

            const msg = {
                topic: entity_id,
                payload: event.new_state.state,
                data: eventMessage,
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
            return outputs.reduce((acc, output) => {
                const result = {
                    output,
                    comparatorMatched: true,
                    actualValue: null,
                    message: null,
                };

                if (output.comparatorPropertyType !== 'always') {
                    result.actualValue = selectn(
                        output.comparatorPropertyValue,
                        eventMessage.event
                    );
                    result.comparatorMatched = this.getComparatorResult(
                        output.comparatorType,
                        output.comparatorValue,
                        result.actualValue,
                        output.comparatorValueDataType,
                        {
                            entity: eventMessage.event.new_state,
                            prevEntity: eventMessage.event.old_state,
                        }
                    );
                }
                result.message = this.getOutputMessage(result, eventMessage);
                acc.push(result);
                return acc;
            }, []);
        }

        getConstraintTargetData(constraint, triggerEvent) {
            const targetData = {
                entityid: null,
                state: null,
            };
            try {
                const isTargetThisEntity =
                    constraint.targetType === 'this_entity';
                targetData.entityid = isTargetThisEntity
                    ? this.nodeConfig.entityid
                    : constraint.targetValue;

                targetData.state = isTargetThisEntity
                    ? triggerEvent
                    : this.nodeConfig.server.homeAssistant.getStates(
                          targetData.entityid
                      );

                if (
                    !isTargetThisEntity &&
                    constraint.propertyType === 'current_state'
                ) {
                    targetData.state = {
                        new_state: targetData.state,
                    };
                }
            } catch (e) {
                this.debug(
                    'Error during trigger:state comparator evaluation: ',
                    e.stack
                );
                throw e;
            }

            return targetData;
        }

        getOutputMessage(
            { output, comparatorMatched, actualValue },
            eventMessage
        ) {
            // If comparator did not match
            if (!comparatorMatched) {
                this.debugToClient(
                    `output comparator failed: property "${output.comparatorPropertyValue}" with value ${actualValue} failed "${output.comparatorType}" check against (${output.comparatorValueDataType}) ${output.comparatorValue}`
                );
                return null;
            }

            let payload = eventMessage.event.new_state.state;
            if (
                output.messageType === 'custom' ||
                output.messageType === 'payload'
            ) {
                // Render Template Variables
                payload = RenderTemplate(
                    output.messageValue,
                    eventMessage.event,
                    this.node.context(),
                    this.nodeConfig.server.name
                );

                switch (output.messageValueType) {
                    case 'num':
                        payload = Number(payload);
                        break;
                    case 'bool':
                        payload = payload === 'true';
                        break;
                    case 'str':
                        break;
                    case 'json':
                    default:
                        try {
                            payload = JSON.parse(payload);
                        } catch (e) {}
                        break;
                }

                if (output.messageType === 'custom') {
                    return payload;
                }
            }

            return {
                topic: eventMessage.entity_id,
                payload,
                data: eventMessage,
            };
        }
    }

    RED.nodes.registerType('trigger-state', TriggerState);
};
