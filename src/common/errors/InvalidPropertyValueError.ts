import BaseError from './InputError';

export default class InvalidPropertyValueError extends BaseError {
    constructor(
        message: string,
        statusMessage = 'home-assistant.error.status.error'
    ) {
        super(message, statusMessage);
        this.name = 'InvalidPropertyValueError';
    }
}
