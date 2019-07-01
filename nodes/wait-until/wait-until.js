module.exports = function(RED) {
    const Joi = require('@hapi/joi');
    const EventsNode = require('../../lib/events-node');

    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            outputs: 1,
            entityId: {},
            property: {},
            comparator: {},
            value: {},
            valueType: {},
            timeout: {},
            timeoutUnits: {},
            entityLocation: {},
            entityLocationType: {},
            checkCurrentState: {},
            blockInputOverrides: nodeDef =>
                nodeDef.blockInputOverrides === undefined
                    ? true
                    : nodeDef.blockInputOverrides
        },
        input: {
            entityId: {
                messageProp: 'payload.entityId',
                configProp: 'entityId',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().label('entityId')
                }
            },
            property: {
                messageProp: 'payload.property',
                configProp: 'property',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().label('property')
                }
            },
            comparator: {
                messageProp: 'payload.comparator',
                configProp: 'comparator',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid(
                            'is',
                            'is_not',
                            'lt',
                            'lte',
                            'gt',
                            'gte',
                            'includes',
                            'does_not_include'
                        )
                        .label('comparator')
                }
            },
            value: {
                messageProp: 'payload.value',
                configProp: 'value',
                validation: {
                    schema: Joi.string().label('value')
                }
            },
            valueType: {
                messageProp: 'payload.valueType',
                configProp: 'valueType',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string().label('valueType')
                }
            },
            timeout: {
                messageProp: 'payload.timeout',
                configProp: 'timeout',
                validation: {
                    schema: Joi.number().label('timeout')
                }
            },
            timeoutUnits: {
                messageProp: 'payload.timeoutUnits',
                configProp: 'timeoutUnits',
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid(
                            'milliseconds',
                            'seconds',
                            'minutes',
                            'hours',
                            'days'
                        )
                        .label('timeoutUnits')
                }
            },
            entityLocation: {
                messageProp: 'payload.entityLocation',
                configProp: 'entityLocation',
                validation: {
                    schema: Joi.string().label('entityLocation')
                }
            },
            entityLocationType: {
                messageProp: 'payload.entityLocationType',
                configProp: 'entityLocationType',
                validation: {
                    schema: Joi.string().label('entityLocationType')
                }
            },
            checkCurrentState: {
                messageProp: 'payload.checkCurrentState',
                configProp: 'checkCurrentState',
                validation: {
                    schema: Joi.boolean().label('checkCurrentState')
                }
            }
        }
    };

    class WaitUntilNode extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.active = false;
            this.savedMessage = {};
            this.timeoutId = -1;
        }

        async onEntityChange(evt) {
            try {
                const event = Object.assign({}, evt.event);

                if (!this.active) {
                    return null;
                }

                const result = await this.getComparatorResult(
                    this.savedConfig.comparator,
                    this.savedConfig.value,
                    this.utils.selectn(
                        this.savedConfig.property,
                        event.new_state
                    ),
                    this.savedConfig.valueType,
                    {
                        message: this.savedMessage,
                        entity: event.new_state
                    }
                );

                if (!result) {
                    return null;
                }

                clearTimeout(this.timeoutId);
                this.active = false;
                this.setStatusSuccess('true');

                if (
                    this.savedConfig.entityLocationType !== 'none' &&
                    this.savedConfig.entityLocation
                ) {
                    event.new_state.timeSinceChangedMs =
                        Date.now() -
                        new Date(event.new_state.last_changed).getTime();

                    this.setContextValue(
                        event.new_state,
                        this.savedConfig.entityLocationType,
                        this.savedConfig.entityLocation,
                        this.savedMessage
                    );
                }

                this.send([this.savedMessage, null]);
            } catch (e) {
                this.error(e, this.savedMessage);
            }
        }

        async onInput({ message, parsedMessage }) {
            const node = this;
            clearTimeout(node.timeoutId);

            if (message.hasOwnProperty('reset')) {
                node.status({ text: 'reset' });
                node.active = false;
                return null;
            }

            node.savedConfig = {
                entityId: parsedMessage.entityId.value,
                property: parsedMessage.property.value,
                comparator: parsedMessage.comparator.value,
                value: parsedMessage.value.value,
                valueType: parsedMessage.valueType.value,
                timeout: parsedMessage.timeout.value,
                timeoutUnits: parsedMessage.timeoutUnits.value,
                entityLocation: parsedMessage.entityLocation.value,
                entityLocationType: parsedMessage.entityLocationType.value,
                checkCurrentState: parsedMessage.checkCurrentState.value
            };

            // If blocking input overrides reset values to nodeConfig
            if (node.nodeConfig.blockInputOverrides === true) {
                Object.keys(node.savedConfig).forEach(
                    key =>
                        (node.savedConfig[key] = (key in node.nodeConfig
                            ? node.nodeConfig
                            : node.savedConfig)[key])
                );
            }

            node.removeEventClientListeners();
            node.addEventClientListener({
                event: `ha_events:state_changed:${node.savedConfig.entityId}`,
                handler: node.onEntityChange.bind(node)
            });

            node.savedMessage = message;
            node.active = true;
            let statusText = 'waiting';

            const timeout = node.savedConfig.timeout;
            if (timeout > 0) {
                const timeoutUnits = node.savedConfig.timeoutUnits;
                if (timeoutUnits === 'milliseconds') {
                    node.timeout = timeout;
                    statusText = `waiting for ${timeout} milliseconds`;
                } else if (timeoutUnits === 'minutes') {
                    node.timeout = timeout * (60 * 1000);
                    statusText = `waiting for ${timeout} minutes`;
                } else if (timeoutUnits === 'hours') {
                    node.timeout = timeout * (60 * 60 * 1000);
                    statusText = node.timeoutStatus(node.timeout);
                } else if (timeoutUnits === 'days') {
                    node.timeout = timeout * (24 * 60 * 60 * 1000);
                    statusText = node.timeoutStatus(node.timeout);
                } else {
                    node.timeout = timeout * 1000;
                    statusText = `waiting for ${timeout} seconds`;
                }

                node.timeoutId = setTimeout(async () => {
                    const state = Object.assign(
                        {},
                        await node.nodeConfig.server.homeAssistant.getStates(
                            node.savedConfig.entityId
                        )
                    );

                    state.timeSinceChangedMs =
                        Date.now() - new Date(state.last_changed).getTime();

                    node.setContextValue(
                        state,
                        node.savedConfig.entityLocationType,
                        node.savedConfig.entityLocation,
                        message
                    );

                    node.active = false;
                    node.send([null, message]);
                    node.setStatusFailed('timed out');
                }, node.timeout);
            }
            node.setStatus({ text: statusText });

            if (node.nodeConfig.checkCurrentState === true) {
                const currentState = await node.nodeConfig.server.homeAssistant.getStates(
                    node.savedConfig.entityId
                );

                node.onEntityChange({ event: { new_state: currentState } });
            }
        }

        timeoutStatus(milliseconds = 0) {
            const timeout = Date.now() + milliseconds;
            const timeoutStr = new Date(timeout).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour12: false,
                hour: 'numeric',
                minute: 'numeric'
            });

            return `waiting until ${timeoutStr}`;
        }
    }

    RED.nodes.registerType('ha-wait-until', WaitUntilNode);
};
