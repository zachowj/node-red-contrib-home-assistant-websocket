import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import UnidirectionalIntegration from '../../common/integration/UnidirectionalEntityIntegration';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { UpdateConfigNode, UpdateConfigNodeProperties } from '.';

export interface UpdateConfigControllerOptions<
    T extends UpdateConfigNode,
    P extends UpdateConfigNodeProperties,
> extends InputOutputControllerOptions<T, P> {
    homeAssistant: HomeAssistant;
}

export default class UpdateConfig<
    T extends UpdateConfigNode,
    P extends UpdateConfigNodeProperties,
> extends InputOutputController<T, P> {
    readonly #homeAssistant: HomeAssistant;
    protected integration?: UnidirectionalIntegration;

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
                'home-assistant.error.error',
            );
        }

        const config = {
            entity_picture: parsedMessage.entityPicture.value,
            name: parsedMessage.name.value,
            icon: parsedMessage.icon.value,
            options: parsedMessage.options.value,
        };

        this.status.setSending();
        await this.integration?.sendUpdateConfig(
            this.integration.getEntityConfigNode().config.server,
            parsedMessage.id.value ?? this.node.id,
            config,
        );
        this.integration.saveHaConfigToContext(config);
        this.status.setSuccess('home-assistant.status.updated');

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
            },
        );
        send(message);
        done();
    }
}
