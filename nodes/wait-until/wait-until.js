const Joi = require('@hapi/joi');
const selectn = require('selectn');

const EventsNode = require('../../lib/events-node');
const RenderTemplate = require('../../lib/mustache-context');
const { shouldIncludeEvent } = require('../../lib/utils');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            name: {},
            server: {
                isNode: true
            },
            outputs: 1,
            entityId: {},
            entityIdFilterType: nodeDef =>
                nodeDef.entityIdFilterType || 'exact',
            property: {},
            comparator: {},
            value: {},
            valueType: {},
            timeout: {},
            timeoutType: nodeDef => nodeDef.timeoutType || 'num',
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
                messageProp: ['payload.entity_id', 'payload.entityId'],
                configProp: 'entityId',
                validation: {
                    haltOnFail: true,
                    schema: Joi.alternatives()
                        .try(
                            Joi.array().items(Joi.string()),
                            Joi.string(),
                            Joi.object().instance(RegExp)
                        )
                        .label('entity_id')
                }
            },
            entityIdFilterType: {
                messageProp: 'payload.entityIdFilterType',
                configProp: 'entityIdFilterType',
                default: 'exact',
                validation: {
                    schema: Joi.string()
                        .valid('exact', 'regex', 'substring')
                        .label('entityIdFilterType')
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
                            'does_not_include',
                            'jsonata'
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
                configProp: 'timeout'
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
            const event = Object.assign({}, evt.event);

            if (!this.active) {
                return null;
            }

            if (
                !shouldIncludeEvent(
                    event.entity_id,
                    this.nodeConfig.entityId,
                    this.nodeConfig.entityIdFilterType
                )
            ) {
                return;
            }

            const result = await this.getComparatorResult(
                this.savedConfig.comparator,
                this.savedConfig.value,
                selectn(this.savedConfig.property, event.new_state),
                this.savedConfig.valueType,
                {
                    message: this.savedMessage,
                    entity: event.new_state
                }
            ).catch(e => {
                this.setStatusFailed('Error');
                this.node.error(e.message, {});
            });

            if (!result) {
                return;
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

                try {
                    this.setContextValue(
                        event.new_state,
                        this.savedConfig.entityLocationType,
                        this.savedConfig.entityLocation,
                        this.savedMessage
                    );
                } catch (e) {
                    this.error(e, this.savedMessage);
                }
            }

            this.send([this.savedMessage, null]);
        }

        async onInput({ message, parsedMessage }) {
            clearTimeout(this.timeoutId);

            if (Object.prototype.hasOwnProperty.call(message, 'reset')) {
                this.status({ text: 'reset' });
                this.active = false;
                return;
            }

            const config = {
                entityId: parsedMessage.entityId.value,
                entityIdFilterType: parsedMessage.entityIdFilterType.value,
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
            if (this.nodeConfig.blockInputOverrides === true) {
                Object.keys(config).forEach(
                    key =>
                        (config[key] = (key in this.nodeConfig
                            ? this.nodeConfig
                            : config)[key])
                );
            }

            // Render mustache templates in the entity id field
            if (
                parsedMessage.entityId.source === 'config' &&
                config.entityIdFilterType === 'exact'
            ) {
                config.entityId = RenderTemplate(
                    parsedMessage.entityId.value,
                    message,
                    this.node.context(),
                    this.nodeConfig.server.name
                );
            }

            // If the timeout field is jsonata type evaluate the expression and
            // it to timeout
            let timeout = config.timeout;
            if (
                parsedMessage.timeout.source === 'config' &&
                this.nodeConfig.timeoutType === 'jsonata'
            ) {
                try {
                    timeout = this.evaluateJSONata(timeout, message);
                } catch (e) {
                    this.node.error(`JSONata Error: ${e.message}`);
                    this.setStatusFailed('Error');
                    return;
                }
                config.timeout = timeout;
            }

            // Validate if timeout is a number >= 0
            if (isNaN(timeout) || timeout < 0) {
                this.node.error(`Invalid value for 'timeout': ${timeout}`);
                this.setStatusFailed('Error');
                return;
            }

            this.removeEventClientListeners();
            let eventTopic = 'ha_events:state_changed';

            if (config.entityId === 'exact') {
                eventTopic = `${eventTopic}:${config.entityId}`;
            }

            this.addEventClientListener(
                eventTopic,
                this.onEntityChange.bind(this)
            );

            this.savedMessage = message;
            this.active = true;
            let statusText = 'waiting';

            if (timeout > 0) {
                statusText = this.getWaitStatusText(
                    timeout,
                    config.timeoutUnits
                );
                timeout = this.getTimeoutInMilliseconds(
                    timeout,
                    config.timeoutUnits
                );

                this.timeoutId = setTimeout(async () => {
                    const state = Object.assign(
                        {},
                        await this.nodeConfig.server.homeAssistant.getStates(
                            config.entityId
                        )
                    );

                    state.timeSinceChangedMs =
                        Date.now() - new Date(state.last_changed).getTime();

                    this.setContextValue(
                        state,
                        config.entityLocationType,
                        config.entityLocation,
                        message
                    );

                    this.active = false;
                    this.send([null, message]);
                    this.setStatusFailed('timed out');
                }, timeout);
            }
            this.setStatus({ text: statusText });
            this.savedConfig = config;

            // Only check current state when filter type is exact
            if (
                config.checkCurrentState === true &&
                config.entityIdFilterType === 'exact'
            ) {
                const currentState = await this.nodeConfig.server.homeAssistant.getStates(
                    config.entityId
                );

                this.onEntityChange({
                    event: {
                        entity_id: config.entityId,
                        new_state: currentState
                    }
                });
            }
        }

        getWaitStatusText(timeout, timeoutUnits) {
            const timeoutMs = this.getTimeoutInMilliseconds(
                timeout,
                timeoutUnits
            );
            switch (timeoutUnits) {
                case 'milliseconds':
                    return `waiting for ${timeout} milliseconds`;
                case 'hours':
                case 'days':
                    return `waiting until ${this.timeoutStatus(timeoutMs)}`;
                case 'minutes':
                default:
                    return `waiting for ${timeout} ${timeoutUnits}: ${this.timeoutStatus(
                        timeoutMs
                    )}`;
            }
        }

        getTimeoutInMilliseconds(timeout, timeoutUnits) {
            switch (timeoutUnits) {
                case 'milliseconds':
                    return timeout;
                case 'minutes':
                    return timeout * (60 * 1000);
                case 'hours':
                    return timeout * (60 * 60 * 1000);
                case 'days':
                    return timeout * (24 * 60 * 60 * 1000);
                default:
                    return timeout * 1000;
            }
        }

        timeoutStatus(milliseconds = 0) {
            const timeout = Date.now() + milliseconds;
            const timeoutStr = new Date(timeout).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour12: false,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });

            return timeoutStr;
        }
    }

    RED.nodes.registerType('ha-wait-until', WaitUntilNode);
};
