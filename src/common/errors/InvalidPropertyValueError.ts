import { i18nKeyandParams } from '../../types/i18n';
import BaseError from './BaseError';

export default class InvalidPropertyValueError extends BaseError {
    constructor(data: i18nKeyandParams, statusMessage?: i18nKeyandParams) {
        super({
            data,
            statusMessage,
            name: 'InvalidPropertyValueError',
        });
    }
}
