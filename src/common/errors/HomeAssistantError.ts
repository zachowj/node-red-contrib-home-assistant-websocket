import { RED } from '../../globals';

interface HaError {
    code: string;
    message: string;
}

export function isHomeAssistantApiError(error: any): error is HaError {
    return error.code !== undefined && error.message !== undefined;
}

export default class HomeAssistantError extends Error {
    readonly #statusMessage: string;

    constructor(
        haError: HaError,
        statusMessage = 'home-assistant.error.error'
    ) {
        super(haError.message);
        this.name = 'HomeAssistantError';
        this.#statusMessage = RED._(statusMessage);
    }
}
