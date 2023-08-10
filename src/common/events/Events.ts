import EventEmitter from 'events';
import Joi from 'joi';
import { Node } from 'node-red';

import { RED } from '../../globals';
import { NodeDone } from '../../types/nodes';
import BaseError from '../errors/BaseError';
import HomeAssistantError, {
    isHomeAssistantApiError,
} from '../errors/HomeAssistantError';
import JSONataError from '../errors/JSONataError';
import Status from '../status/Status';

type EventHandler = (...args: any[]) => void | Promise<void>;
export type EventsList = [string | symbol, EventHandler][];

export enum NodeEvent {
    Close = 'close',
    Input = 'input',
    StateChanged = 'state_changed',
}

export default class Events {
    #listeners: EventsList = [];
    #status?: Status;

    protected readonly node;
    protected readonly emitter;

    constructor({ node, emitter }: { node: Node; emitter: EventEmitter }) {
        this.node = node;
        this.emitter = emitter;
        emitter.setMaxListeners(0);

        node.on(NodeEvent.Close, this.#onClose.bind(this));
    }

    #errorHandler(callback: EventHandler) {
        return async (...args: any) => {
            try {
                // eslint-disable-next-line n/no-callback-literal
                await callback(...args);
            } catch (e) {
                let statusMessage = RED._('home-assistant.status.error');
                let error = e;
                if (e instanceof Joi.ValidationError) {
                    error = new JSONataError(e);
                    statusMessage = RED._(
                        'home-assistant.status.validation_error'
                    );
                } else if (isHomeAssistantApiError(e)) {
                    error = new HomeAssistantError(e);
                } else if (e instanceof BaseError) {
                    statusMessage = e.statusMessage;
                } else if (typeof e === 'string') {
                    error = new Error(e);
                } else {
                    error = new Error(
                        `Unrecognized error ${JSON.stringify(e)}`
                    );
                }
                this.node.error(error);
                this.#status?.setFailed(statusMessage);
            }
        };
    }

    #onClose(_removed: boolean, done: NodeDone) {
        this.removeListeners();
        done();
    }

    public addListener(
        event: string | symbol,
        handler: EventHandler,
        options = { once: false }
    ): void {
        const handlerWrapper = this.#errorHandler(handler);

        this.#listeners.push([event, handlerWrapper]);

        if (options.once === true) {
            this.emitter.once(event, handlerWrapper);
        } else {
            this.emitter.on(event, handlerWrapper);
        }
    }

    public addListeners(bind: unknown, eventsList: EventsList) {
        eventsList.forEach(([event, handler]) => {
            this.addListener(event, handler.bind(bind));
        });
    }

    public removeListeners() {
        this.#listeners.forEach(([event, handler]) => {
            this.emitter.removeListener(event, handler);
        });
        this.#listeners = [];
    }

    // set status for error reporting
    public setStatus(status: Status) {
        this.#status = status;
    }

    public emit(event: string | symbol, ...args: unknown[]): boolean {
        return this.emitter.emit(event, ...args);
    }
}
