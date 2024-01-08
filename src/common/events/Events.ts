import EventEmitter from 'events';
import { Node } from 'node-red';

import { NodeDone } from '../../types/nodes';
import { getErrorData } from '../errors/inputErrorHandler';
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
                const { error, statusMessage } = getErrorData(e);
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
        options = { once: false },
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
