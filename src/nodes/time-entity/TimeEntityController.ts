import { NodeMessage } from 'node-red';

import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { IntegrationEvent } from '../../common/integration/Integration';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import { ValueIntegrationMode } from '../../const';
import { EntityConfigNode } from '../entity-config';
import { TimeEntityNode, TimeEntityNodeProperties } from '.';

type TimeEntityControllerConstructor = InputOutputControllerOptions<
    TimeEntityNode,
    TimeEntityNodeProperties
>;

export default class TimeEntityController extends InputOutputController<
    TimeEntityNode,
    TimeEntityNodeProperties
> {
    protected integration?: ValueEntityIntegration;
    #entityConfigNode?: EntityConfigNode;

    constructor(props: TimeEntityControllerConstructor) {
        super(props);
        this.#entityConfigNode = this.integration?.getEntityConfigNode();
    }

    // Handles input messages when the node is in "get" mode
    async #onInputModeGet({ done, message, send }: InputProperties) {
        const value = this.#entityConfigNode?.state?.getLastPayload()?.state as
            | string
            | undefined;

        this.status.setSuccess(value);
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            value,
        });

        send(message);
        done();
    }

    // Handles input messages when the node is in "set" mode
    async #onInputModeSet({
        done,
        message,
        parsedMessage,
        send,
    }: InputProperties) {
        if (!this.integration?.isConnected) {
            throw new NoConnectionError();
        }
        if (!this.integration?.isIntegrationLoaded) {
            throw new InputError(
                'home-assistant.error.integration_not_loaded',
                'home-assistant.status.error'
            );
        }

        const value = this.typedInputService.getValue(
            parsedMessage.value.value,
            parsedMessage.valueType.value,
            {
                message,
            }
        );

        // get previous value before updating
        const previousValue = this.#entityConfigNode?.state?.getLastPayload()
            ?.state as string | undefined;
        await this.#prepareSend(message, value);
        // send value change to all time nodes
        this.#entityConfigNode?.emit(
            IntegrationEvent.ValueChange,
            value,
            previousValue
        );

        send(message);
        done();
    }

    protected async onInput({
        done,
        message,
        parsedMessage,
        send,
    }: InputProperties) {
        if (this.node.config.mode === ValueIntegrationMode.Get) {
            this.#onInputModeGet({ done, message, parsedMessage, send });
        } else if (this.node.config.mode === ValueIntegrationMode.Set) {
            await this.#onInputModeSet({ done, message, parsedMessage, send });
        } else {
            throw new InputError(
                'ha-text.error.mode_not_supported',
                'home-assistant.status.error'
            );
        }
    }

    // Triggers when a entity value changes in Home Assistant
    public async onValueChange(value: string, previousValue?: string) {
        const message: NodeMessage = {};
        await this.#prepareSend(message, value, previousValue);

        this.node.send(message);
    }

    /**
     * Checks if the given time string is in the format "HH:mm:ss" or "HH:mm".
     * @param text The time string to check.
     * @returns True if the time string is in the correct format, false otherwise.
     */
    #isValidValue(text: string): boolean {
        const pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        const regex = new RegExp(pattern);
        return regex.test(text);

        return true;
    }

    /**
     * Formats the given time string to the format "HH:mm:ss".
     * If the seconds are not provided, it defaults to "00".
     * @param text The time string to format.
     * @returns The formatted time string.
     */
    #getFormattedValue(text: string): string {
        const [hours, minutes, seconds] = text.split(':');

        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${
            seconds?.padStart(2, '0') ?? '00'
        }`;
    }

    // Take care of repetative code in onInput and onValueChange
    async #prepareSend(
        message: NodeMessage,
        value: string,
        previousValue?: string
    ): Promise<void> {
        if (this.#isValidValue(value) === false) {
            throw new InputError(
                'ha-time-entity.error.invalid_format',
                'home-assistant.status.error'
            );
        }

        value = this.#getFormattedValue(value);

        await this.integration?.updateHomeAssistant(value);
        if (!previousValue) {
            previousValue = this.#entityConfigNode?.state?.getLastPayload()
                ?.state as string | undefined;
        }
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            value,
            previousValue,
        });
        this.#entityConfigNode?.state?.setLastPayload({
            state: value,
            attributes: {},
        });
        this.status.setSuccess(value);
    }
}
