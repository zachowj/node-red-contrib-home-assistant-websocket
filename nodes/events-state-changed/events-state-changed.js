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
            if (
                this.isEnabled === false ||
                !this.isHomeAssistantRunning ||
                !this.isEventValid(evt)
            ) {
                return;
            }

            const config = this.nodeConfig;
            const eventMessage = cloneDeep(evt);
            const oldState = selectn('event.old_state', eventMessage);
            const newState = selectn('event.new_state', eventMessage);

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

            if (validTimer) {
                if (
                    // If if state is not used and prev and current state is the same return because  timer should already be running
                    oldState.state === newState.state ||
                    // Don't run timers for on connect updates
                    runAll ||
                    // Timer already active and ifState is still true turn don't update
                    (isIfState && this.topics[eventMessage.entity_id].active)
                ) {
                    return;
                }

                if (
                    ['lt', 'lte', 'gt', 'gte'].includes(
                        config.halt_if_compare
                    ) &&
                    !isIfState
                ) {
                    this.topics[eventMessage.entity_id].active = false;
                }
            }

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

            clearTimeout(this.topics[eventMessage.entity_id].id);
            this.topics[eventMessage.entity_id].active = true;
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
                data: eventMessage.event,
            };

            eventMessage.event.new_state.timeSinceChangedMs =
                Date.now() -
                new Date(eventMessage.event.new_state.last_changed).getTime();

            const statusMessage = `${eventMessage.event.new_state.state}${
                eventMessage.event.event_type === 'triggered'
                    ? ` (triggered)`
                    : ''
            }`;

            clearTimeout(this.topics[eventMessage.entity_id].id);

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

        isEventValid(evt) {
            if (
                shouldIncludeEvent(
                    evt.entity_id,
                    this.nodeConfig.entityidfilter,
                    this.nodeConfig.entityidfiltertype
                ) ||
                (this.nodeConfig.ignorePrevStateNull && evt.event.old_state) ||
                (this.nodeConfig.ignorePrevStateUnknown &&
                    evt.event.old_state.state !== 'unknown') ||
                (this.nodeConfig.ignorePrevStateUnavailable &&
                    evt.event.old_state.state !== 'unavailable') ||
                (this.nodeConfig.ignoreCurrentStateUnknown &&
                    evt.event.new_state.state !== 'unknown') ||
                (this.nodeConfig.ignoreCurrentStateUnavailable &&
                    evt.event.new_state.state !== 'unavailable')
            ) {
                return true;
            }

            return false;
        }
    }

    RED.nodes.registerType('server-state-changed', ServerStateChangedNode);
};
