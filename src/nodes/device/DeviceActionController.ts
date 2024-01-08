import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import NoConnectionError from '../../common/errors/NoConnectionError';
import NoIntegrationError from '../../common/errors/NoIntegrationError';
import { MessageType } from '../../common/integration/Integration';
import { DeviceNode, DeviceNodeProperties } from '.';

export default class DeviceAction extends InputOutputController<
    DeviceNode,
    DeviceNodeProperties
> {
    async onInput({ message, send, done }: InputProperties) {
        if (!this.homeAssistant?.isConnected) {
            throw new NoConnectionError();
        }

        if (!this.homeAssistant.isIntegrationLoaded) {
            throw new NoIntegrationError();
        }

        const capabilities = this.node.config.capabilities?.reduce(
            (acc, cap) => {
                acc[cap.name] = cap.value;
                return acc;
            },
            {} as Record<string, unknown>,
        );
        const payload = {
            type: MessageType.DeviceAction,
            action: { ...this.node.config.event, ...capabilities },
        };

        await this.homeAssistant.websocket.send(payload);

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                data: payload,
            },
        );

        this.status.setSuccess(
            `${this.node.config.event?.domain}.${this.node.config.event?.type}`,
        );
        send(message);
        done();
    }
}
