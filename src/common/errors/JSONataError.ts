import BaseError from './BaseError';

export default class JSONataError extends BaseError {
    constructor(error: Error) {
        super({
            data: error.message,
            name: 'JSONataError',
            defaultStatusMessage: 'home-assistant.status.jsonata_error',
        });
    }
}
