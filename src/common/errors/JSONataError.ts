import { RED } from '../../globals';
import BaseError from './BaseError';

export default class JSONataError extends BaseError {
    public statusMessage: string;

    constructor(error: Error) {
        super(error.message);
        this.name = 'JSONataError';
        this.message = error.message;
        this.statusMessage = RED._('home-assistant.status.jsonata_error');
    }
}
