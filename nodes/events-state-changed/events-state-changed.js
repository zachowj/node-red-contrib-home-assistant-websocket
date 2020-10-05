const cloneDeep = require('lodash.clonedeep');
const selectn = require('selectn');

const EventsHaNode = require('../../lib/events-ha-node');
const {
    shouldIncludeEvent,
    getWaitStatusText,
    getTimeInMilliseconds,
} = require('../../lib/utils');

module.exports = function (RED) {
    const nodeOptions = {
        config: {
            entityidfilter: {},
            entityidfiltertype: {},
            haltIfState: (nodeDef) =>
                nodeDef.haltifstate ? nodeDef.haltifstate.trim() : null,
            halt_if_type: (nodeDef) => nodeDef.halt_if_type || 'str',
            halt_if_compare: (nodeDef) => nodeDef.halt_if_compare || 'is',
            outputinitially: {},
            state_type: (nodeDef) => nodeDef.state_type || 'str',
            output_only_on_state_change: {},
            for: (nodeDef) => nodeDef.for || '0',
            forType: (nodeDef) => nodeDef.forType || 'num',
            forUnits: (nodeDef) => nodeDef.forUnits || 'minutes',
            ignorePrevStateNull: {},
            ignorePrevStateUnknown: {},
            ignorePrevStateUnavailable: {},
            ignoreCurrentStateUnknown: {},
            ignoreCurrentStateUnavailable: {},
        },
    };

    class ServerStateChangedNode extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            let eventTopic = 'ha_events:state_changed';
            this.topics = [];

            if (this.nodeConfig.entityidfiltertype === 'exact') {
                eventTopic = this.eventTopic = `ha_events:state_changed:${this.nodeConfig.entityidfilter}`;
            }

            this.addEventClientListener(
                eventTopic,
                this.onHaEventsStateChanged.bind(this)
            );

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

        async onHaEventsStateChanged(evt, runAll) {
            const config = this.nodeConfig;
            if (
                this.isEnabled === false ||
                !this.isHomeAssistantRunning ||
                !shouldIncludeEvent(
                    evt.entity_id,
                    this.nodeConfig.entityidfilter,
                    this.nodeConfig.entityidfiltertype
                )
            ) {
                return;
            }

            const eventMessage = cloneDeep(evt);
            const oldState = selectn('event.old_state', eventMessage);
            const newState = selectn('event.new_state', eventMessage);

            if (
                (config.ignorePrevStateNull && !oldState) ||
                (config.ignorePrevStateUnknown &&
                    oldState.state === 'unknown') ||
                (config.ignorePrevStateUnavailable &&
                    oldState.state === 'unavailable') ||
                (config.ignoreCurrentStateUnknown &&
                    newState.state === 'unknown') ||
                (config.ignoreCurrentStateUnavailable &&
                    newState.state === 'unavailable')
            ) {
                return;
            }

            // Convert and save original state if needed
            this.castState(oldState, config.state_type);
            this.castState(newState, config.state_type);

            // Output only on state change
            if (
                runAll === undefined &&
                config.output_only_on_state_change === true &&
                oldState.state === newState.state
            ) {
                return;
            }

            // Get if state condition
            const isIfState = await this.getComparatorResult(
                config.halt_if_compare,
                config.haltIfState,
                newState.state,
                config.halt_if_type,
                {
                    entity: newState,
                    prevEntity: oldState,
                }
            );

            // Track multiple entity ids
            this.topics[eventMessage.entity_id] =
                this.topics[eventMessage.entity_id] || {};

            let timer;
            try {
                timer = this.getTimerValue();
            } catch (e) {
                this.node.error(e.message);
                this.setStatusFailed('Error');
                return;
            }
            const validTimer = timer > 0;

            // If if state is not used and prev and current state is the same return because  timer should already be running
            if (validTimer && oldState.state === newState.state) return;

            // Don't run timers for on connect updates
            if (validTimer && runAll) return;

            if (
                !validTimer ||
                (config.haltIfState && !isIfState) ||
                eventMessage.event_type === 'triggered'
            ) {
                this.output(eventMessage, isIfState);
                return;
            }

            const statusText = getWaitStatusText(
                timer,
                this.nodeConfig.forUnits
            );
            const timeout = getTimeInMilliseconds(
                timer,
                this.nodeConfig.forUnits
            );

            this.node.status({
                text: statusText,
            });

            clearInterval(this.topics[eventMessage.entity_id].id);
            this.topics[eventMessage.entity_id].id = setTimeout(
                this.output.bind(this, eventMessage, isIfState),
                timeout
            );
        }

        getTimerValue() {
            if (this.nodeConfig.for === '') return 0;
            const timer = this.getTypedInputValue(
                this.nodeConfig.for,
                this.nodeConfig.forType
            );

            if (isNaN(timer) || timer < 0) {
                throw new Error(`Invalid value for 'for': ${timer}`);
            }

            return timer;
        }

        getTypedInputValue(value, valueType, oldEntity, newEntity) {
            let val;
            switch (valueType) {
                case 'flow':
                case 'global':
                    val = this.getContextValue(valueType, value, null);
                    break;
                case 'jsonata':
                    val = this.evaluateJSONata(
                        value,
                        null,
                        oldEntity,
                        newEntity
                    );
                    break;
                case 'num':
                default:
                    val = Number(value);
            }
            return val;
        }

        output(eventMessage, condition) {
            const config = this.nodeConfig;
            const msg = {
                topic: eventMessage.entity_id,
                payload: eventMessage.event.new_state.state,
                data: eventMessage,
            };

            eventMessage.event.new_state.timeSinceChangedMs =
                Date.now() -
                new Date(eventMessage.event.new_state.last_changed).getTime();

            const statusMessage = `${eventMessage.event.new_state.state}${
                eventMessage.event.event_type === 'triggered'
                    ? ` (triggered)`
                    : ''
            }`;

            clearInterval(this.topics[eventMessage.entity_id].id);

            // Handle version 0 'halt if' outputs. The output were reversed true
            // was sent to the second output and false was the first output
            // ! Deprecated: Remove before 1.0
            if (config.version < 1) {
                if (config.haltIfState && condition) {
                    this.setStatusFailed(statusMessage);
                    this.send([null, msg]);
                    return;
                }
                this.setStatusSuccess(statusMessage);
                this.send([msg, null]);
                return;
            }

            if (config.haltIfState && !condition) {
                this.setStatusFailed(statusMessage);
                this.send([null, msg]);
                return;
            }

            this.setStatusSuccess(statusMessage);
            this.send([msg, null]);
        }

        getNodeEntityId() {
            return (
                this.nodeConfig.entityidfiltertype === 'exact' &&
                this.nodeConfig.entityidfilter
            );
        }

        triggerNode(eventMessage) {
            this.onHaEventsStateChanged(eventMessage, false);
        }

        async onDeploy() {
            const entities = await this.nodeConfig.server.homeAssistant.getStates();
            this.onStatesLoaded(entities);
        }

        onStatesLoaded(entities) {
            if (!this.isEnabled) return;

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

                this.onHaEventsStateChanged(eventMessage, true);
            }
        }
    }

    RED.nodes.registerType('server-state-changed', ServerStateChangedNode);
};
