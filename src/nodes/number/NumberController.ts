import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import BidirectionalEntityIntegration, {
    StateChangePayload,
} from '../../common/integration/BidirectionalEntityIntegration';
import { EntityBaseNodeProperties, OutputProperty } from '../../types/nodes';
import { NumberNode } from '.';

export interface NumberNodeProperties extends EntityBaseNodeProperties {
    state: string;
    stateType: string;
    outputProperties: OutputProperty[];
}

export default class NumberController extends InputOutputController<
    NumberNode,
    NumberNodeProperties
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

        if (typeof state !== 'number') {
            throw new InputError(
                'ha-number.error.state_not_number',
                'home-assistant.status.error'
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
        const value = Number(payload.state);
        if (isNaN(value)) return;

        this.state?.setLastPayload({
            state: value,
            attributes: {},
        });
    }
}
