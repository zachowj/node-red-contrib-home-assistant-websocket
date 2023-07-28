import BaseError, { BaseErrorData } from './BaseError';

interface HaError {
    code: string;
    message: string;
}

export function isHomeAssistantApiError(error: any): error is HaError {
    return error.code !== undefined && error.message !== undefined;
}

export default class HomeAssistantError extends BaseError {
    constructor(haError: HaError, statusMessage?: BaseErrorData) {
        super({
            data: haError.message,
            statusMessage,
            name: 'HomeAssistantError',
        });
    }
}
