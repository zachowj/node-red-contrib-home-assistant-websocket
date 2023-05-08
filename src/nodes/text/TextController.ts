import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import BidirectionalEntityIntegration, {
    StateChangePayload,
} from '../../common/integration/BidirectionalEntityIntegration';
import { EntityBaseNodeProperties, OutputProperty } from '../../types/nodes';
import { TextNode } from '.';

export interface TextNodeProperties extends EntityBaseNodeProperties {
    state: string;
    stateType: string;
    outputProperties: OutputProperty[];
}

export default class TextController extends InputOutputController<
    TextNode,
    TextNodeProperties
> {
    protected integration?: BidirectionalEntityIntegration;

    protected async onInput({
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
                'home-assistant.error.error'
            );
        }

        const state = this.typedInputService.getValue(
            parsedMessage.state.value,
            parsedMessage.stateType.value,
            {
                message,
            }
        );

        if (this.#validState(state) === false) {
            throw new InputError(
                'home-assistant.error.pattern_not_matched',
                'home-assistant.error.error'
            );
        }

        this.state?.setLastPayload({ state, attributes: {} });
        await this.integration.updateHomeAssistant(state);

        this.status.setSuccess(state.toString());
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            entityState: state,
        });

        send(message);
        done();
    }

    public async onValueChange(payload: StateChangePayload) {
        if (typeof payload.state !== 'string') return;

        if (this.#validState(payload.state)) {
            this.state?.setLastPayload({
                state: payload.state,
                attributes: {},
            });
        }
    }

    #validState(text: string): boolean {
        const haConfig =
            this.integration?.getEntityConfigNode().config.haConfig;
        const pattern = haConfig?.find((item) => item.property === 'pattern')
            ?.value as string;

        if (pattern) {
            const regex = new RegExp(pattern);
            return regex.test(text);
        }

        return true;
    }
}
