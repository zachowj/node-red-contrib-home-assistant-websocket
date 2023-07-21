import EventEmitter from 'events';
import Joi from 'joi';
import { Node } from 'node-red';

import { RED } from '../../globals';
import { ClientEvent } from '../../homeAssistant/Websocket';
import BaseError from '../errors/BaseError';
import Status from '../status/Status';
import Events, { EventHandler } from './Events';

export default class ClientEvents extends Events {
    #status?: Status;

    constructor({ node, emitter }: { node: Node; emitter: EventEmitter }) {
        super({ node, emitter });

        this.emitter.on(ClientEvent.Error, this.onHaEventsError.bind(this));
    }

    addListener(
        event: string | symbol,
        handler: EventHandler,
        options = { once: false }
    ): void {
        super.addListener(event, this.#errorHandler(handler), options);
    }

    onHaEventsError(err: Error) {
        if (err?.message) this.node.error(err.message);
    }

    // set status for error reporting
    setStatus(status: Status) {
        this.#status = status;
    }

    #errorHandler(callback: any) {
        return (...args: any) => {
            try {
                // eslint-disable-next-line n/no-callback-literal
                callback(...args);
            } catch (e) {
                let statusMessage = RED._('home-assistant.status.error');
                if (e instanceof Joi.ValidationError) {
                    statusMessage = RED._(
                        'home-assistant.status.validation_error'
                    );
                    this.node.error(e);
                } else if (e instanceof BaseError) {
                    statusMessage = e.statusMessage;
                    this.node.error(e);
                } else if (e instanceof Error) {
                    this.node.error(e);
                } else if (typeof e === 'string') {
                    this.node.error(new Error(e));
                } else {
                    this.node.error(new Error(`Unrecognised error: ${e}`));
                }
                this.#status?.setFailed(statusMessage);
            }
        };
    }
}
