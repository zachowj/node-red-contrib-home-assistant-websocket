import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { UpdateConfigNode, UpdateConfigNodeProperties } from '.';

export interface UpdateConfigControllerOptions<
    T extends UpdateConfigNode,
    P extends UpdateConfigNodeProperties
> extends InputOutputControllerOptions<T, P> {
    homeAssistant: HomeAssistant;
}

export default class UpdateConfig<
    T extends UpdateConfigNode,
    P extends UpdateConfigNodeProperties
> extends InputOutputController<T, P> {
    readonly #homeAssistant: HomeAssistant;

    constructor(props: UpdateConfigControllerOptions<T, P>) {
        super(props);
        this.#homeAssistant = props.homeAssistant;
    }

    async onInput({ parsedMessage, message, send, done }: InputProperties) {
        if (!this.integration?.isConnected) {
            throw new NoConnectionError();
        }

        if (!this.integration?.isIntegrationLoaded) {
            throw new InputError(
                'home-assistant.error.integration_not_loaded',
                'home-assistant.error.error'
            );
        }

        this.status.setSending();
        await this.integration?.sendUpdateConfig(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.node.config.server!,
            parsedMessage.id.value ?? this.node.id,
            {
                entity_picture: parsedMessage.entityPicture.value,
                name: parsedMessage.name.value,
                icon: parsedMessage.icon.value,
            }
        );
        this.status.setSuccess('home-assistant.status.updated');

        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
        });
        send(message);
        done();
    }
}
