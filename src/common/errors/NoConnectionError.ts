import BaseError, { BaseErrorData } from './BaseError';

export default class NoConnectionError extends BaseError {
    constructor(data?: BaseErrorData, statusMessage?: BaseErrorData) {
        super({
            data,
            statusMessage,
            name: 'NoConnectionError',
            defaultStatusMessage: 'home-assistant.status.no_connection',
        });
    }
}
