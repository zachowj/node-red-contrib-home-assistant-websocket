import { RED } from '../../globals';

export default class BaseError extends Error {
    public statusMessage: string;

    constructor(
        message: string,
        statusMessage = 'home-assistant.error.failed'
    ) {
        super(message);
        this.name = 'BaseError';
        this.message = RED._(message);
        this.statusMessage = RED._(statusMessage);
    }
}
