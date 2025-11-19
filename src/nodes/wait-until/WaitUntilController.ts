import Joi from 'joi';
import { cloneDeep } from 'lodash';
import { NodeMessage } from 'node-red';
import selectn from 'selectn';

import { IdSelectorType } from '../../common/const';
import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import { setTimeoutWithErrorHandling } from '../../common/errors/inputErrorHandler';
import ClientEvents from '../../common/events/ClientEvents';
import ComparatorService from '../../common/services/ComparatorService';
import { DataSource } from '../../common/services/InputService';
import JSONataService from '../../common/services/JSONataService';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { renderTemplate } from '../../helpers/mustache';
import {
    getTimeInMilliseconds,
    getWaitStatusText,
    shouldIncludeEvent,
} from '../../helpers/utils';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { HassEntity } from '../../types/home-assistant';
import { NodeDone, NodeSend } from '../../types/nodes';
import { WaitUntilNode, WaitUntilNodeProperties, WaitUntilProperties } from '.';

interface WaitUntilControllerConstructor
    extends InputOutputControllerOptions<
        WaitUntilNode,
        WaitUntilNodeProperties
    > {
    comparatorService: ComparatorService;
    clientEvents: ClientEvents;
    homeAssistant: HomeAssistant;
    jsonataService: JSONataService;
}

interface SavedConfig
    extends Omit<
        WaitUntilProperties,
        'timeoutType' | 'blockInputOverrides' | 'outputProperties'
    > {
    send: NodeSend;
    done: NodeDone;
}

const resetSchema = Joi.object({
    reset: Joi.any().required(),
}).unknown(true);

export default class WaitUntil extends InputOutputController<
    WaitUntilNode,
    WaitUntilNodeProperties
> {
    #active = false;
    #comparatorService: ComparatorService;
    #clientEvents: ClientEvents;
    #homeAssistant: HomeAssistant;
    #jsonataService: JSONataService;
    #savedConfig?: SavedConfig;
    #savedMessage?: NodeMessage;
    #timeoutId?: NodeJS.Timeout;
    #hasDeprecatedWarned = false;

    constructor(params: WaitUntilControllerConstructor) {
        super(params);
        this.#comparatorService = params.comparatorService;
        this.#clientEvents = params.clientEvents;
        this.#homeAssistant = params.homeAssistant;
        this.#jsonataService = params.jsonataService;

        this.addOptionalInput(
            'reset',
            resetSchema,
            this.#onResetInput.bind(this),
        );
    }

    #validateAndConvertTimeout(result: unknown): number {
        const timeout = Number(result);

        if (result === null || isNaN(timeout) || timeout < 0) {
            throw new InputError(
                [
                    'ha-wait-until.error.invalid_timeout',
                    { timeout: String(result) },
                ],
                'ha-wait-until.error.error',
            );
        }

        return timeout;
    }

    async #onEntityChange(evt: {
        event: {
            entity_id: string;
            new_state?: HassEntity;
            old_state?: HassEntity;
        };
    }) {
        const { event } = cloneDeep(evt);

        if (
            !this.#savedConfig ||
            !this.#active ||
            !this.#homeAssistant.isConnected
        ) {
            return;
        }

        // Check if the event should be included
        const valid = Object.entries(this.#savedConfig.entities).some(
            ([type, ids]) => {
                return ids?.some((id) =>
                    shouldIncludeEvent(event.entity_id, id, type),
                );
            },
        );

        if (!valid) {
            return;
        }

        const result = await this.#comparatorService.getComparatorResult(
            this.#savedConfig.comparator,
            this.#savedConfig.value,
            selectn(this.#savedConfig.property, event.new_state),
            this.#savedConfig.valueType,
            {
                message: this.#savedMessage,
                entity: event.new_state,
            },
        );

        if (!result) {
            return;
        }

        const { send, done } = this.#savedConfig;
        clearTimeout(this.#timeoutId);
        this.#active = false;
        this.status.setSuccess('ha-wait-until.status.true');

        if (event.new_state) {
            event.new_state.timeSinceChangedMs =
                Date.now() - new Date(event.new_state.last_changed).getTime();
        }

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            this.#savedMessage ?? {},
            {
                entity: event.new_state,
                config: this.node.config,
            },
        );

        send([this.#savedMessage, null]);
        done();
    }

    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        clearTimeout(this.#timeoutId);

        const config: SavedConfig = {
            entities: parsedMessage.entities.value,
            property: parsedMessage.property.value,
            comparator: parsedMessage.comparator.value,
            value: parsedMessage.value.value,
            valueType: parsedMessage.valueType.value,
            timeout: parsedMessage.timeout.value,
            timeoutUnits: parsedMessage.timeoutUnits.value,
            checkCurrentState: parsedMessage.checkCurrentState.value,
            send,
            done,
        };

        // TODO: remove in v1.0
        if (parsedMessage.entityId.source === DataSource.Message) {
            if (!this.#hasDeprecatedWarned) {
                this.#hasDeprecatedWarned = true;
                this.node.warn(
                    RED._('ha-wait-until.error.entity_id_deprecated'),
                );
            }
        }

        if (parsedMessage.entities.source === DataSource.Config) {
            // Render mustache templates in the entity id field when it's from the config
            config.entities[IdSelectorType.Entity] =
                parsedMessage.entities.value[IdSelectorType.Entity].map(
                    (e: string) =>
                        renderTemplate(
                            e,
                            message,
                            this.node.context(),
                            this.#homeAssistant.websocket.getStates(),
                        ),
                );
        }

        // If the timeout field is jsonata type evaluate the expression and
        // it to timeout
        let timeout = Number(config.timeout);
        if (
            parsedMessage.timeout.source === DataSource.Config &&
            this.node.config.timeoutType === TypedInputTypes.JSONata
        ) {
            timeout = await this.#jsonataService.evaluate(
                parsedMessage.timeout.value,
                {
                    message,
                },
            );
            timeout = this.#validateAndConvertTimeout(timeout);
            config.timeout = timeout.toString();
        }

        // Validate if timeout is a number >= 0
        if (isNaN(timeout) || timeout < 0) {
            throw new InputError(
                ['ha-wait-until.error.invalid_timeout', { timeout }],
                'homassistant.error.error',
            );
        }

        this.#clientEvents.removeListeners();
        if (
            parsedMessage.entities.value[IdSelectorType.Substring].length ===
                0 &&
            parsedMessage.entities.value[IdSelectorType.Regex].length === 0
        ) {
            for (const entity of parsedMessage.entities.value[
                IdSelectorType.Entity
            ]) {
                const eventTopic = `ha_events:state_changed:${entity?.trim()}`;
                this.#clientEvents.addListener(
                    eventTopic,
                    this.#onEntityChange.bind(this),
                );
            }
        } else {
            this.#clientEvents.addListener(
                'ha_events:state_changed',
                this.#onEntityChange.bind(this),
            );
        }

        this.#savedMessage = message;
        this.#active = true;
        let statusText = 'ha-wait-until.status.waiting';

        if (timeout > 0) {
            statusText = getWaitStatusText(timeout, config.timeoutUnits);
            timeout = getTimeInMilliseconds(timeout, config.timeoutUnits);

            this.#timeoutId = setTimeoutWithErrorHandling(
                async () => {
                    let state: HassEntity | undefined;
                    if (this.#isSingleEntitySelected()) {
                        state = this.#homeAssistant.websocket.getState(
                            config.entities[IdSelectorType.Entity][0],
                        ) as HassEntity;

                        if (state) {
                            state.timeSinceChangedMs =
                                Date.now() -
                                new Date(state.last_changed).getTime();
                        }
                    }

                    await this.setCustomOutputs(
                        this.node.config.outputProperties,
                        message,
                        {
                            entity: state,
                            config: this.node.config,
                        },
                    );

                    this.#active = false;
                    this.status.setFailed('ha-wait-until.status.timed_out');
                    send([null, message]);
                    done();
                },
                timeout,
                { done, status: this.status },
            );
        }
        this.status.setText(statusText);
        this.#savedConfig = config;

        // Only check current state when filter type is exact
        if (
            config.checkCurrentState === true &&
            this.#isSingleEntitySelected()
        ) {
            const entityId = config.entities[IdSelectorType.Entity][0];
            const currentState =
                this.#homeAssistant.websocket.getState(entityId);

            if (!currentState) {
                throw new InputError(
                    ['ha-wait-until.error.entity_not_found', { entityId }],
                    'ha-wait-until.error.not_found',
                );
            }

            await this.#onEntityChange({
                event: {
                    entity_id: entityId,
                    new_state: currentState as HassEntity,
                },
            });
        }
    }

    protected onClose(removed: boolean, done?: NodeDone): void {
        this.#clientEvents.removeListeners();
        clearTimeout(this.#timeoutId);
        done?.();
    }

    #onResetInput(): boolean {
        clearTimeout(this.#timeoutId);
        this.#active = false;
        this.status.setText('reset');

        return true;
    }

    #isSingleEntitySelected(): boolean {
        return (
            this.node.config.entities[IdSelectorType.Entity].length === 1 &&
            this.node.config.entities[IdSelectorType.Substring].length === 0 &&
            this.node.config.entities[IdSelectorType.Regex].length === 0
        );
    }
}
