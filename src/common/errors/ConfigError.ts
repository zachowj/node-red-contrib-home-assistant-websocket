import BaseError, { BaseErrorData } from './BaseError';

export default class ConfigError extends BaseError {
    constructor(data: BaseErrorData, statusMessage?: BaseErrorData) {
        super({
            data,
            statusMessage,
            name: 'ConfigError',
        });
    }
}
