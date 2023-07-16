import { RED } from '../../globals';
import BaseError from './BaseError';

export default class InputError extends BaseError {
    public statusMessage: string;

    constructor(
        message: string,
        statusMessage = 'home-assistant.status.failed'
    ) {
        super(message);
        this.name = 'InputError';
        this.message = RED._(message);
        this.statusMessage = RED._(statusMessage);
    }
}
