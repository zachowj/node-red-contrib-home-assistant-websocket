import { RED } from '../../globals';

export default class InputError extends Error {
    public statusMessage: string;

    constructor(
        message: string,
        statusMessage = 'home-assistant.error.failed'
    ) {
        super(message);
        this.name = 'InputError';
        this.message = RED._(message);
        this.statusMessage = RED._(statusMessage);
    }
}
