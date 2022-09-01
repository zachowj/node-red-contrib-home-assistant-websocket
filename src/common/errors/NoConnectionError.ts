import BaseError from './InputError';

export default class NoConnectionError extends BaseError {
    constructor(
        message = 'home-assistant.error.no_connection',
        statusMessage = 'home-assistant.status.no_connection'
    ) {
        super(message, statusMessage);
        this.name = 'NoConnectionError';
    }
}
