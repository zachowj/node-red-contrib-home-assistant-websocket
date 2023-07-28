import BaseError, { BaseErrorData } from './BaseError';

export default class InvalidPropertyValueError extends BaseError {
    constructor(data: BaseErrorData, statusMessage?: BaseErrorData) {
        super({
            data,
            statusMessage,
            name: 'InvalidPropertyValueError',
        });
    }
}
