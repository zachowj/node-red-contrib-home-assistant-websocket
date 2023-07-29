import { i18nKeyandParams } from '../../types/i18n';
import BaseError from './BaseError';

export default class NoConnectionError extends BaseError {
    constructor(data?: i18nKeyandParams, statusMessage?: i18nKeyandParams) {
        super({
            data,
            statusMessage,
            name: 'NoConnectionError',
            defaultStatusMessage: 'home-assistant.status.no_connection',
        });
    }
}
