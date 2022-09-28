import Joi from 'joi';
import { cloneDeep } from 'lodash';
import { NodeMessage } from 'node-red';
import selectn from 'selectn';

import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import ClientEvents from '../../common/events/ClientEvents';
import ComparatorService from '../../common/services/ComparatorService';
import JSONataService from '../../common/services/JSONataService';
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

    constructor(params: WaitUntilControllerConstructor) {
        super(params);
        this.#comparatorService = params.comparatorService;
        this.#clientEvents = params.clientEvents;
        this.#homeAssistant = params.homeAssistant;
        this.#jsonataService = params.jsonataService;

        this.addOptionalInput(
            'reset',
            resetSchema,
            this.#onResetInput.bind(this)
        );
    }

    #onEntityChange(evt: {
        event: {
            entity_id: string;
            new_state: HassEntity;
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

        if (
            !shouldIncludeEvent(
                event.entity_id,
                this.#savedConfig.entityId,
                this.#savedConfig.entityIdFilterType
            )
        ) {
            return;
        }

        const result = this.#comparatorService.getComparatorResult(
            this.#savedConfig.comparator,
            this.#savedConfig.value,
            selectn(this.#savedConfig.property, event.new_state),
            this.#savedConfig.valueType,
            {
                message: this.#savedMessage,
                entity: event.new_state,
            }
        );

        if (!result) {
            return;
        }

        const { send, done } = this.#savedConfig;
        clearTimeout(this.#timeoutId);
        this.#active = false;
        this.status.setSuccess('true');

        event.new_state.timeSinceChangedMs =
            Date.now() - new Date(event.new_state.last_changed).getTime();

        this.setCustomOutputs(
            this.node.config.outputProperties,
            this.#savedMessage ?? {},
            {
                entity: event.new_state,
                config: this.node.config,
            }
        );

        send([this.#savedMessage, null]);
        done();
    }

    async onInput({ message, parsedMessage, send, done }: InputProperties) {
        clearTimeout(this.#timeoutId);

        const config: SavedConfig = {
            entityId: parsedMessage.entityId.value,
            entityIdFilterType: parsedMessage.entityIdFilterType.value,
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

        // Render mustache templates in the entity id field
        if (
            parsedMessage.entityId.source === 'config' &&
            config.entityIdFilterType === 'exact'
        ) {
            config.entityId = renderTemplate(
                parsedMessage.entityId.value,
                message,
                this.node.context(),
                this.#homeAssistant.websocket.getStates()
            );
        }

        // If the timeout field is jsonata type evaluate the expression and
        // it to timeout
        let timeout = Number(config.timeout);
        if (
            parsedMessage.timeout.source === 'config' &&
            this.node.config.timeoutType === 'jsonata'
        ) {
            timeout = this.#jsonataService.evaluate(
                parsedMessage.timeout.value,
                {
                    message,
                }
            );
            config.timeout = timeout.toString();
        }

        // Validate if timeout is a number >= 0
        if (isNaN(timeout) || timeout < 0) {
            throw new InputError(
                `Invalid value for 'timeout': ${timeout}`,
                'homassistant.error.error'
            );
        }

        this.#clientEvents.removeListeners();
        const eventTopic = `ha_events:state_changed${
            config.entityIdFilterType === 'exact'
                ? `:${config.entityId.trim()}`
                : ''
        }`;
        this.#clientEvents.addListener(
            eventTopic,
            this.#onEntityChange.bind(this)
        );

        this.#savedMessage = message;
        this.#active = true;
        let statusText = 'waiting';

        if (timeout > 0) {
            statusText = getWaitStatusText(timeout, config.timeoutUnits);
            timeout = getTimeInMilliseconds(timeout, config.timeoutUnits);

            this.#timeoutId = setTimeout(() => {
                const state = Object.assign(
                    {},
                    this.#homeAssistant.websocket.getStates(
                        config.entityId
                    ) as HassEntity
                );

                state.timeSinceChangedMs =
                    Date.now() - new Date(state.last_changed).getTime();

                this.setCustomOutputs(
                    this.node.config.outputProperties,
                    message,
                    {
                        entity: state,
                        config: this.node.config,
                    }
                );

                this.#active = false;
                this.status.setFailed('timed out');
                send([null, message]);
                done();
            }, timeout);
        }
        this.status.setText(statusText);
        this.#savedConfig = config;

        // Only check current state when filter type is exact
        if (
            config.checkCurrentState === true &&
            config.entityIdFilterType === 'exact'
        ) {
            const currentState = this.#homeAssistant.websocket.getStates(
                config.entityId
            ) as HassEntity;

            this.#onEntityChange({
                event: {
                    entity_id: config.entityId,
                    new_state: currentState,
                },
            });
        }
    }

    #onResetInput(): boolean {
        clearTimeout(this.#timeoutId);
        this.#active = false;
        this.status.setText('reset');

        return true;
    }
}
