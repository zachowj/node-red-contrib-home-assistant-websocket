const cloneDeep = require('lodash.clonedeep');
const Joi = require('joi');
const selectn = require('selectn');

const EventsNode = require('./EventsNode');
const RenderTemplate = require('../helpers/mustache-context');
const {
    shouldIncludeEvent,
    getWaitStatusText,
    getTimeInMilliseconds,
} = require('../helpers/utils');

const nodeOptions = {
    config: {
        name: {},
        server: {
            isNode: true,
        },
        outputs: 1,
        entityId: {},
        entityIdFilterType: {},
        property: {},
        comparator: {},
        value: {},
        valueType: {},
        timeout: {},
        timeoutType: {},
        timeoutUnits: {},
        entityLocation: {},
        entityLocationType: {},
        checkCurrentState: {},
        blockInputOverrides: {},
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
                    .label('entity_id'),
            },
        },
        entityIdFilterType: {
            messageProp: 'payload.entityIdFilterType',
            configProp: 'entityIdFilterType',
            default: 'exact',
            validation: {
                schema: Joi.string()
                    .valid('exact', 'regex', 'substring')
                    .label('entityIdFilterType'),
            },
        },
        property: {
            messageProp: 'payload.property',
            configProp: 'property',
            validation: {
                haltOnFail: true,
                schema: Joi.string().label('property'),
            },
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
                    .label('comparator'),
            },
        },
        value: {
            messageProp: 'payload.value',
            configProp: 'value',
            validation: {
                schema: Joi.string().label('value'),
            },
        },
        valueType: {
            messageProp: 'payload.valueType',
            configProp: 'valueType',
            validation: {
                haltOnFail: true,
                schema: Joi.string().label('valueType'),
            },
        },
        timeout: {
            messageProp: 'payload.timeout',
            configProp: 'timeout',
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
                    .label('timeoutUnits'),
            },
        },
        entityLocation: {
            messageProp: 'payload.entityLocation',
            configProp: 'entityLocation',
            validation: {
                schema: Joi.string().label('entityLocation'),
            },
        },
        entityLocationType: {
            messageProp: 'payload.entityLocationType',
            configProp: 'entityLocationType',
            validation: {
                schema: Joi.string().label('entityLocationType'),
            },
        },
        checkCurrentState: {
            messageProp: 'payload.checkCurrentState',
            configProp: 'checkCurrentState',
            validation: {
                schema: Joi.boolean().label('checkCurrentState'),
            },
        },
    },
};

class WaitUntil extends EventsNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });
        this.active = false;
        this.savedMessage = {};
        this.timeoutId = -1;
    }

    onEntityChange(evt) {
        const { event } = cloneDeep(evt);

        if (!this.active || !this.isHomeAssistantRunning) {
            return;
        }

        if (
            !shouldIncludeEvent(
                event.entity_id,
                this.savedConfig.entityId,
                this.savedConfig.entityIdFilterType
            )
        ) {
            return;
        }

        const result = this.getComparatorResult(
            this.savedConfig.comparator,
            this.savedConfig.value,
            selectn(this.savedConfig.property, event.new_state),
            this.savedConfig.valueType,
            {
                message: this.savedMessage,
                entity: event.new_state,
            }
        );

        if (!result) {
            return;
        }

        const { send, done } = this.savedConfig;
        clearTimeout(this.timeoutId);
        this.active = false;
        this.status.setSuccess('true');

        if (
            this.savedConfig.entityLocationType !== 'none' &&
            this.savedConfig.entityLocation
        ) {
            event.new_state.timeSinceChangedMs =
                Date.now() - new Date(event.new_state.last_changed).getTime();

            try {
                this.setContextValue(
                    event.new_state,
                    this.savedConfig.entityLocationType,
                    this.savedConfig.entityLocation,
                    this.savedMessage
                );
            } catch (e) {
                done(e, this.savedMessage);
            }
        }

        send([this.savedMessage, null]);
        done();
    }

    onInput({ message, parsedMessage, send, done }) {
        clearTimeout(this.timeoutId);

        if (Object.prototype.hasOwnProperty.call(message, 'reset')) {
            this.status.setText('reset');
            this.active = false;
            done();
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
            checkCurrentState: parsedMessage.checkCurrentState.value,
        };

        // If blocking input overrides reset values to nodeConfig
        if (this.nodeConfig.blockInputOverrides === true) {
            Object.keys(config).forEach(
                (key) =>
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
                timeout = this.evaluateJSONata(timeout, { message });
            } catch (e) {
                this.status.setFailed('Error');
                done(`JSONata Error: ${e.message}`);
                return;
            }
            config.timeout = timeout;
        }

        // Validate if timeout is a number >= 0
        if (isNaN(timeout) || timeout < 0) {
            this.status.setFailed('Error');
            done(`Invalid value for 'timeout': ${timeout}`);
            return;
        }

        this.removeEventClientListeners();
        let eventTopic = 'ha_events:state_changed';

        if (config.entityIdFilterType === 'exact') {
            eventTopic = `${eventTopic}:${config.entityId}`;
        }

        this.addEventClientListener(eventTopic, this.onEntityChange.bind(this));

        this.savedMessage = message;
        this.active = true;
        let statusText = 'waiting';

        if (timeout > 0) {
            statusText = getWaitStatusText(timeout, config.timeoutUnits);
            timeout = getTimeInMilliseconds(timeout, config.timeoutUnits);

            this.timeoutId = setTimeout(() => {
                const state = Object.assign(
                    {},
                    this.homeAssistant.getStates(config.entityId)
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
                this.status.setFailed('timed out');
                send([null, message]);
                done();
            }, timeout);
        }
        this.status.setText(statusText);
        this.savedConfig = config;
        this.savedConfig.send = send;
        this.savedConfig.done = done;

        // Only check current state when filter type is exact
        if (
            config.checkCurrentState === true &&
            config.entityIdFilterType === 'exact'
        ) {
            const currentState = this.homeAssistant.getStates(config.entityId);

            this.onEntityChange({
                event: {
                    entity_id: config.entityId,
                    new_state: currentState,
                },
            });
        }
    }
}

module.exports = WaitUntil;
