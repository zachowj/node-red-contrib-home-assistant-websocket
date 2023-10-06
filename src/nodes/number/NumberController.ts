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
import { NumberNode, NumberNodeProperties } from '.';

type NumberControllerConstructor = InputOutputControllerOptions<
    NumberNode,
    NumberNodeProperties
>;

export default class NumberController extends InputOutputController<
    NumberNode,
    NumberNodeProperties
> {
    protected integration?: ValueEntityIntegration;
    #entityConfigNode?: EntityConfigNode;

    constructor(props: NumberControllerConstructor) {
        super(props);
        this.#entityConfigNode = this.integration?.getEntityConfigNode();
    }

    async #onInputModeGet({ done, message, send }: InputProperties) {
        const value = this.#entityConfigNode?.state?.getLastPayload()?.state as
            | string
            | undefined;

        this.status.setSuccess(value);
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                value,
            }
        );

        send(message);
        done();
    }

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

        let value = await this.typedInputService.getValue(
            parsedMessage.value.value,
            parsedMessage.valueType.value,
            {
                message,
            }
        );

        if (typeof value !== 'number') {
            throw new InputError(
                'ha-number.error.value_not_number',
                'home-assistant.status.error'
            );
        }

        value = this.#getValidatedValue(value);
        // get previous value before updating
        const previousValue = this.#entityConfigNode?.state?.getLastPayload()
            ?.state as number | undefined;
        await this.integration?.updateValue(value);

        // send value change to all number nodes
        this.#entityConfigNode?.emit(
            IntegrationEvent.ValueChange,
            value,
            previousValue
        );

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                value,
                previousValue,
            }
        );
        this.status.setSuccess(value.toString());
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

    public async onValueChange(value: number, previousValue?: number) {
        if (isNaN(value)) return;

        const message: NodeMessage = {};

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                value,
                previousValue,
            }
        );
        this.status.setSuccess(value.toString());
        this.node.send(message);
    }

    // keep the number in range if min/max is set in the entity config
    #getValidatedValue(value: number): number {
        const min = Number(
            this.integration?.getEntityHomeAssistantConfigValue('min_value')
        );
        const max = Number(
            this.integration?.getEntityHomeAssistantConfigValue('max_value')
        );
        if (min && value < min) {
            value = min;
        }
        if (max && value > max) {
            value = max;
        }

        return value;
    }
}
