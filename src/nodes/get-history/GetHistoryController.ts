import timestring from 'timestring';

import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import SendSplitMixin from '../../common/controllers/SendSplitMixin';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { DataSource } from '../../common/services/InputService';
import { renderTemplate } from '../../helpers/mustache';
import { GetHistoryNode, GetHistoryNodeProperties } from '.';
import { EntityFilterType, OutputType } from './const';

const SendSplitController = SendSplitMixin(
    InputOutputController<GetHistoryNode, GetHistoryNodeProperties>,
);
export default class GetHistoryController extends SendSplitController {
    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        if (!this.homeAssistant.websocket.isConnected) {
            throw new NoConnectionError();
        }

        const { entityIdType, relativeTime } = parsedMessage;
        const flatten = parsedMessage.flatten.value as boolean;
        let startDate = new Date(parsedMessage.startDate.value);
        let endDate = new Date(parsedMessage.endDate.value);

        let entityId: string;
        if (parsedMessage.entityId.source === DataSource.Message) {
            entityId = parsedMessage.entityId.value;
        } else {
            // Only render the template if it's from the config
            entityId = renderTemplate(
                parsedMessage.entityId.value,
                message,
                this.node.context(),
                this.homeAssistant.websocket.getStates(),
            );
        }
        if (parsedMessage.entityIdType.value === EntityFilterType.Regex) {
            const entities = Object.keys(
                this.homeAssistant.websocket.getStates(),
            );
            const regex = new RegExp(entityId);
            entityId = entities
                .filter((entity) => regex.test(entity))
                .join(',');
            if (!entityId) {
                throw new InputError(
                    'api-get-history.error.no_entity_ids_matched',
                );
            }
        }

        if (
            this.node.config.useRelativeTime ||
            // If the relative time is from the message, we need to check if it's a relative time
            parsedMessage.relativeTime.source === DataSource.Message
        ) {
            try {
                const relativeTimeMs = timestring(relativeTime.value, 'ms');
                startDate = new Date(Date.now() - relativeTimeMs);
                endDate = new Date();
            } catch (e) {
                throw new InputError(
                    'api-get-history.error.invalid_relative_time',
                );
            }
        }

        this.status.setSending('api-get-history.status.requesting');
        let results = await this.homeAssistant.http.getHistory(
            isNaN(startDate.getTime()) ? '' : startDate.toISOString(),
            entityId,
            isNaN(endDate.getTime()) ? '' : endDate.toISOString(),
            flatten,
        );

        switch (this.node.config.outputType) {
            case OutputType.Split:
                if (results.length === 0) {
                    this.status.setFailed('api-get-history.status.no_results');
                    done();
                    return;
                }

                if (
                    entityIdType.value === EntityFilterType.Equals &&
                    !flatten &&
                    Array.isArray(results[0])
                ) {
                    results = results[0];
                }

                this.sendSplit(message, results, send);
                break;

            case OutputType.Array:
            default:
                this.contextService.set(
                    results,
                    this.node.config.outputLocationType,
                    this.node.config.outputLocation,
                    message,
                );
                send(message);
                break;
        }

        this.status.setSuccess();
        done();
    }
}
