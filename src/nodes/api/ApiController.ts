import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { DataSource } from '../../common/services/InputService';
import { TypedInputTypes } from '../../const';
import { generateRenderTemplate } from '../../helpers/mustache';
import { ApiNode, ApiNodeProperties } from '.';
import { ApiMethod, ApiProtocol } from './const';

export default class ApiController extends InputOutputController<
    ApiNode,
    ApiNodeProperties
> {
    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        if (!this.homeAssistant.websocket.isConnected) {
            throw new NoConnectionError();
        }

        const renderTemplate = generateRenderTemplate(
            message,
            this.node.context(),
            this.homeAssistant.websocket.getStates(),
        );

        let data;
        if (parsedMessage.data.source === DataSource.Message) {
            data = parsedMessage.data.value;
        } else if (parsedMessage.data.value?.length > 0) {
            if (parsedMessage.dataType.value === TypedInputTypes.JSONata) {
                data = await this.jsonataService.evaluate(
                    parsedMessage.data.value,
                    {
                        message,
                    },
                );
            } else {
                data = JSON.parse(
                    renderTemplate(
                        typeof parsedMessage.data.value === 'object'
                            ? JSON.stringify(parsedMessage.data.value)
                            : parsedMessage.data.value,
                    ),
                );
            }
        }

        let results;
        if (parsedMessage.protocol.value === ApiProtocol.Http) {
            const path = renderTemplate(parsedMessage.path.value).replace(
                /^\/(?:api\/)?/,
                '',
            );

            if (!path) {
                throw new InputError('ha-api.error.requires_path');
            }
            if (
                !Object.values(ApiMethod).includes(parsedMessage.method.value)
            ) {
                throw new InputError([
                    'ha-api.error.invalid_method',
                    { method: parsedMessage.method.value },
                ]);
            }

            const method = parsedMessage.method.value;
            this.debugToClient({ method, path, data });

            switch (method) {
                case ApiMethod.Get:
                    results = await this.homeAssistant.http.get(
                        path,
                        data,
                        parsedMessage.responseType.value,
                    );
                    break;
                case ApiMethod.Post:
                    results = await this.homeAssistant.http.post(
                        path,
                        data,
                        parsedMessage.responseType.value,
                    );
                    break;
                case ApiMethod.Put:
                    results = await this.homeAssistant.http.put(
                        path,
                        data,
                        parsedMessage.responseType.value,
                    );
                    break;
                case ApiMethod.Delete:
                    results = await this.homeAssistant.http.delete(
                        path,
                        data,
                        parsedMessage.responseType.value,
                    );
            }
        } else {
            if (!('type' in data)) {
                throw new InputError('ha-api.error.requires_type');
            }

            this.debugToClient(JSON.stringify(data));

            this.status.setSending();
            results = await this.homeAssistant.websocket.send(data);
        }

        await this.setCustomOutputs(
            parsedMessage.outputProperties.value,
            message,
            {
                results,
                config: this.node.config,
            },
        );

        this.status.setSuccess([
            'ha-api.status.method_called',
            { method: parsedMessage.protocol.value },
        ]);

        send(message);
        done();
    }
}
