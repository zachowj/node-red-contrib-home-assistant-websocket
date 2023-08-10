import { i18nKeyandParams } from '../../types/i18n';
import BaseError from './BaseError';

export default class NoIntegrationError extends BaseError {
    constructor(data?: i18nKeyandParams, statusMessage?: i18nKeyandParams) {
        super({
            data,
            statusMessage,
            name: 'NoIntegrationError',
            defaultStatusMessage: 'home-assistant.error.integration_not_loaded',
        });
    }
}
