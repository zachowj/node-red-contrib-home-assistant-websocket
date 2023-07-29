import { RED } from '../../globals';
import { i18nKeyandParams } from '../../types/i18n';

export interface BaseErrorConstructor {
    data?: i18nKeyandParams;
    defaultStatusMessage?: string;
    name?: string;
    statusMessage?: i18nKeyandParams;
}

export default abstract class BaseError extends Error {
    #statusMessage: string;

    constructor({
        data,
        statusMessage,
        name,
        defaultStatusMessage,
    }: BaseErrorConstructor) {
        const [key, params] = Array.isArray(data) ? data : [data, undefined];
        const message = key
            ? RED._(key, params)
            : RED._('home-assistant.error.unknown');
        super(message);
        this.message = message;
        this.name = name ?? 'BaseError';

        // Set status message
        let [statusKey, statusParams] = Array.isArray(statusMessage)
            ? statusMessage
            : [statusMessage, undefined];
        statusKey ??= defaultStatusMessage ?? 'home-assistant.status.error';

        this.#statusMessage = RED._(statusKey, statusParams);
    }

    get statusMessage(): string {
        return this.#statusMessage;
    }
}
