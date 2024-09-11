import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { MessageType } from '../../common/integration/Integration';
import { DataSource } from '../../common/services/InputService';
import { SentenceNode, SentenceNodeProperties } from '.';

export default class SentenceController extends InputOutputController<
    SentenceNode,
    SentenceNodeProperties
> {
    public async onInput({
        done,
        message,
        parsedMessage,
        send,
    }: InputProperties): Promise<void> {
        if (!this.integration?.isConnected) {
            throw new NoConnectionError();
        }
        if (!this.integration?.isIntegrationLoaded) {
            throw new InputError(
                'home-assistant.error.integration_not_loaded',
                'home-assistant.status.error',
            );
        }

        const response =
            parsedMessage.response.source === DataSource.Config
                ? await this.typedInputService.getValue(
                      parsedMessage.response.value,
                      parsedMessage.responseType.value,
                      {
                          message,
                      },
                  )
                : parsedMessage.response.value;

        this.status.setSending();

        await this.homeAssistant.websocket.send({
            type: MessageType.SentenceResponse,
            response,
            response_id: parsedMessage.responseId.value,
        });

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
            },
        );
        this.status.setSuccess();
        send(message);
        done();
    }
}
