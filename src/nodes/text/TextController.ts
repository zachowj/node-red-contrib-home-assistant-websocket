import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { IntegrationEvent } from '../../common/integration/Integration';
import ValueEntityIntegration from '../../common/integration/ValueEntityIntegration';
import { ValueIntegrationMode } from '../../const';
import { NodeMessage } from '../../types/nodes';
import { EntityConfigNode } from '../entity-config';
import { TextNode, TextNodeProperties } from '.';

type TextControllerConstructor = InputOutputControllerOptions<
    TextNode,
    TextNodeProperties
>;

export default class TextController extends InputOutputController<
    TextNode,
    TextNodeProperties
> {
    protected integration?: ValueEntityIntegration;
    #entityConfigNode?: EntityConfigNode;

    constructor(props: TextControllerConstructor) {
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

        const value = await this.typedInputService.getValue(
            parsedMessage.value.value,
            parsedMessage.valueType.value,
            {
                message,
            }
        );

        if (this.#isValidValue(value) === false) {
            throw new InputError(
                'home-assistant.error.pattern_not_matched',
                'home-assistant.status.error'
            );
        }

        // get previous value before updating
        const previousValue = this.#entityConfigNode?.state?.getLastPayload()
            ?.state as string | undefined;
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
        this.status.setSuccess(value);
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
            await this.#onInputModeGet({ done, message, parsedMessage, send });
        } else if (this.node.config.mode === ValueIntegrationMode.Set) {
            await this.#onInputModeSet({ done, message, parsedMessage, send });
        } else {
            throw new InputError(
                'ha-text.error.mode_not_supported',
                'home-assistant.status.error'
            );
        }
    }

    #isValidValue(text: string): boolean {
        const pattern = this.integration?.getEntityHomeAssistantConfigValue(
            'pattern'
        ) as string;

        if (pattern) {
            const regex = new RegExp(pattern);
            return regex.test(text);
        }

        return true;
    }

    public async onValueChange(value: string, previousValue?: string) {
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
        this.status.setSuccess(value);
        this.node.send(message);
    }
}
