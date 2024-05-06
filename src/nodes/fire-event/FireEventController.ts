import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { TypedInputTypes } from '../../const';
import { renderTemplate } from '../../helpers/mustache';
import { FireEventNode, FireEventNodeProperties } from '.';
import { DataSource } from '../../common/services/InputService';
import { event } from 'jquery';

export default class FireEventController extends InputOutputController<
    FireEventNode,
    FireEventNodeProperties
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

        const eventType =
            parsedMessage.event.source === DataSource.Message
                ? parsedMessage.event.value
                : renderTemplate(
                      parsedMessage.event.value,
                      message,
                      this.node.context(),
                      this.homeAssistant.websocket.getStates(),
                  );

        let eventData: unknown;
        if (parsedMessage.data.source === DataSource.Message) {
            eventData = parsedMessage.data.value;
        } else if (parsedMessage.data.value) {
            if (parsedMessage.dataType.value === TypedInputTypes.JSONata) {
                eventData = await this.jsonataService.evaluate(
                    parsedMessage.data.value,
                    {
                        message,
                    },
                );
            } else {
                const dataString = renderTemplate(
                    typeof parsedMessage.data.value === 'object'
                        ? JSON.stringify(parsedMessage.data.value)
                        : parsedMessage.data.value,
                    message,
                    this.node.context(),
                    this.homeAssistant.websocket.getStates(),
                );
                try {
                    eventData = JSON.parse(dataString);
                } catch (e) {
                    eventData = dataString;
                }
            }
        }

        this.node.debug(`Fire Event: ${eventType} -- ${JSON.stringify({})}`);

        this.status.setSending();

        await this.homeAssistant.websocket.send({
            type: 'fire_event',
            event_type: eventType,
            event_data: eventData,
        });

        this.status.setSuccess(eventType);
        send(message);
        done();
    }
}
