import { RED } from '../../globals';
import { i18nKeyandParams } from '../../types/i18n';

export interface BaseErrorConstructor {
    data?: i18nKeyandParams;
    defaultStatusMessage?: string;
    name?: string;
    statusMessage?: i18nKeyandParams;
}

export function isTranslationKey(key?: unknown): boolean {
    if (typeof key !== 'string') {
        return false;
    }

    return !key.includes(' ') && key.includes('.');
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
        let message: string | undefined;
        if (key) {
            message = isTranslationKey(key) ? RED._(key, params) : key;
        }
        super(message);
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
