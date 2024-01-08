import { HassEntities } from 'home-assistant-js-websocket';
import { cloneDeep } from 'lodash';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController, {
    OutputControllerConstructor,
} from '../../common/controllers/OutputController';
import ConfigError from '../../common/errors/ConfigError';
import ComparatorService from '../../common/services/ComparatorService';
import TransformState, { TransformType } from '../../common/TransformState';
import {
    getTimeInMilliseconds,
    getWaitStatusText,
    shouldIncludeEvent,
} from '../../helpers/utils';
import { HassStateChangedEvent } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { EventsStateNode } from '.';

interface EventsStateNodeConstructor
    extends OutputControllerConstructor<EventsStateNode> {
    comparatorService: ComparatorService;
    transformState: TransformState;
}

enum State {
    Unknown = 'unknown',
    Unavailable = 'unavailable',
}

const ExposeAsController = ExposeAsMixin(OutputController<EventsStateNode>);
export default class EventsStateController extends ExposeAsController {
    #comparatorService: ComparatorService;
    #topics: Record<string, { timeoutId?: NodeJS.Timeout; active: boolean }> =
        {};

    #transformState: TransformState;

    constructor(props: EventsStateNodeConstructor) {
        super(props);
        this.#comparatorService = props.comparatorService;
        this.#transformState = props.transformState;
    }

    async #getTimerValue() {
        if (this.node.config.for === '') return 0;
        const timer = await this.typedInputService.getValue(
            this.node.config.for,
            this.node.config.forType,
        );

        if (isNaN(timer) || timer < 0) {
            throw new ConfigError([
                'server-state-changed.error.invalid_for',
                { for: timer, type: this.node.config.forType },
            ]);
        }

        return Number(timer);
    }

    #isEventValid(evt: HassStateChangedEvent) {
        const oldState = evt.event?.old_state?.state;
        const newState = evt.event?.new_state?.state;
        if (
            !shouldIncludeEvent(
                evt.entity_id,
                this.node.config.entityId,
                this.node.config.entityIdType,
            ) ||
            (this.node.config.ignorePrevStateNull && !evt.event.old_state) ||
            (this.node.config.ignorePrevStateUnknown &&
                oldState === State.Unknown) ||
            (this.node.config.ignorePrevStateUnavailable &&
                oldState === State.Unavailable) ||
            (this.node.config.ignoreCurrentStateUnknown &&
                newState === State.Unknown) ||
            (this.node.config.ignoreCurrentStateUnavailable &&
                newState === State.Unavailable)
        ) {
            return false;
        }

        return true;
    }

    public async onHaEventsStateChanged(
        evt: HassStateChangedEvent,
        runAll = false,
    ) {
        if (
            this.isEnabled === false ||
            !this.homeAssistant.isHomeAssistantRunning ||
            !this.#isEventValid(evt)
        ) {
            return;
        }

        const config = this.node.config;
        const eventMessage = cloneDeep(evt);
        const entityId = eventMessage.entity_id;
        const oldEntity = eventMessage.event.old_state;
        const newEntity = eventMessage.event.new_state;
        // Convert and save original state if needed
        if (oldEntity && this.node.config.stateType !== TransformType.String) {
            oldEntity.original_state = oldEntity.state as string;
            oldEntity.state = this.#transformState.transform(
                this.node.config.stateType,
                oldEntity.state as string,
            );
        }
        if (newEntity && this.node.config.stateType !== TransformType.String) {
            newEntity.original_state = newEntity.state as string;
            newEntity.state = this.#transformState.transform(
                this.node.config.stateType,
                newEntity.state as string,
            );
        }
        const oldState = oldEntity ? oldEntity.state : undefined;
        const newState = newEntity ? newEntity.state : undefined;

        // Output only on state change
        if (
            runAll === false &&
            config.outputOnlyOnStateChange === true &&
            oldState === newState
        ) {
            return;
        }

        // Get if state condition
        const isIfState = await this.#comparatorService.getComparatorResult(
            config.ifStateOperator,
            config.ifState,
            newState,
            config.ifStateType,
            {
                entity: newEntity ?? undefined,
                prevEntity: oldEntity ?? undefined,
            },
        );

        // Track multiple entity ids
        this.#topics[entityId] = this.#topics[entityId] || { active: false };

        const timer = await this.#getTimerValue();

        const validTimer = timer > 0;

        if (validTimer) {
            if (
                // If the ifState is not used and prev and current state are the same return because timer should already be running
                oldState === newState ||
                // Don't run timers for on connection updates
                runAll ||
                // Timer already active and ifState is still true turn don't update
                (config.ifState && isIfState && this.#topics[entityId].active)
            ) {
                return;
            }

            if (config.ifState && !isIfState) {
                this.#topics[entityId].active = false;
            }
        }

        if (!validTimer || (config.ifState && !isIfState)) {
            await this.output(eventMessage, isIfState);
            return;
        }

        const statusText = getWaitStatusText(timer, this.node.config.forUnits);
        const timeout = getTimeInMilliseconds(timer, this.node.config.forUnits);

        this.status.setText(statusText);

        clearTimeout(this.#topics[entityId].timeoutId);
        this.#topics[entityId] = {
            active: true,
            timeoutId: setTimeout(
                this.output.bind(this, eventMessage, isIfState),
                timeout,
            ),
        };
    }

    async output(eventMessage: HassStateChangedEvent, condition: boolean) {
        const config = this.node.config;
        const message: NodeMessage = {};
        await this.setCustomOutputs(config.outputProperties, message, {
            config,
            entity: eventMessage.event.new_state,
            entityState: eventMessage.event.new_state?.state,
            eventData: eventMessage.event,
            prevEntity: eventMessage.event.old_state,
            triggerId: eventMessage.entity_id,
        });

        if (eventMessage.event.new_state) {
            eventMessage.event.new_state.timeSinceChangedMs =
                Date.now() -
                new Date(eventMessage.event.new_state.last_changed).getTime();
        }

        const statusMessage = `${eventMessage.event.new_state?.state}`;

        clearTimeout(this.#topics[eventMessage.entity_id].timeoutId);

        if (config.ifState && !condition) {
            this.status.setFailed(statusMessage);
            this.node.send([null, message]);
            return;
        }

        this.status.setSuccess(statusMessage);
        this.node.send([message, null]);
    }

    public onDeploy() {
        const entities = this.homeAssistant.websocket.getStates();
        this.onStatesLoaded(entities);
    }

    onStatesLoaded(entities: HassEntities) {
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

            this.onHaEventsStateChanged(
                eventMessage as HassStateChangedEvent,
                true,
            );
        }
    }
}
