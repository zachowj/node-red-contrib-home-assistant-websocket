import BaseError from './BaseError';

export default class InvalidPropertyValueError extends BaseError {
    constructor(
        message: string,
        statusMessage = 'home-assistant.status.error'
    ) {
        super(message, statusMessage);
        this.name = 'InvalidPropertyValueError';
    }
}
