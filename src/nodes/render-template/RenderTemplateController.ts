import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { TypedInputTypes } from '../../const';
import { RenderTemplateNode, RenderTemplateNodeProperties } from '.';

export default class RenderTemplateController extends InputOutputController<
    RenderTemplateNode,
    RenderTemplateNodeProperties
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

        const {
            template,
            templateLocation,
            templateLocationType,
            resultsLocation,
            resultsLocationType,
        } = parsedMessage;

        this.status.setSending('api-render-template.status.requesting');

        const results = await this.homeAssistant.http.renderTemplate(
            template.value
        );

        if (templateLocationType.value !== TypedInputTypes.None) {
            this.contextService.set(
                template.value,
                templateLocationType.value,
                templateLocation.value,
                message
            );
        }
        this.contextService.set(
            results,
            resultsLocationType.value,
            resultsLocation.value,
            message
        );

        send(message);
        this.status.setSuccess();
        done();
    }
}
