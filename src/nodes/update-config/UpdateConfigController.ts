import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import HomeAssistantError, {
    isHomeAssistantApiError,
} from '../../common/errors/HomeAssistantError';
import InputError from '../../common/errors/InputError';
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
        if (!this.#homeAssistant.isIntegrationLoaded) {
            throw new InputError(
                'home-assistant.error.integration_not_loaded',
                'home-assistant.error.error'
            );
        }

        this.status.setSending();
        try {
            const payload = {
                type: 'nodered/entity/update_config',
                server_id: this.node.config.server,
                node_id: parsedMessage.id.value ?? this.node.id,
                config: {
                    name: parsedMessage.name.value,
                    icon: parsedMessage.icon.value,
                },
            };
            await this.#homeAssistant.websocket.send(payload);
            this.status.setSuccess('updated');
            this.debugToClient(payload);
        } catch (err) {
            if (isHomeAssistantApiError(err)) {
                throw new HomeAssistantError(err, 'home-assistant.error.error');
            }

            throw err;
        }

        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
        });
        send(message);
        done();
    }
}
