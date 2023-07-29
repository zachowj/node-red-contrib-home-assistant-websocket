import { i18nKeyandParams } from '../../types/i18n';
import BaseError from './BaseError';

interface HaError {
    code: string;
    message: string;
}

export function isHomeAssistantApiError(error: any): error is HaError {
    return error.code !== undefined && error.message !== undefined;
}

export default class HomeAssistantError extends BaseError {
    constructor(haError: HaError, statusMessage?: i18nKeyandParams) {
        super({
            data: haError.message,
            statusMessage,
            name: 'HomeAssistantError',
        });
    }
}
