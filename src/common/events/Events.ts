import EventEmitter from 'events';

import { BaseNode } from '../../types/nodes';

export type EventHandler = (...args: any[]) => void;
export type EventsList = [string | symbol, EventHandler][];

export default class Events {
    listeners: EventsList = [];
    protected readonly node;
    protected readonly emitter;

    constructor({ node, emitter }: { node: BaseNode; emitter: EventEmitter }) {
        this.node = node;
        this.emitter = emitter;

        node.on('close', this.onClose.bind(this));
    }

    onClose(_removed: boolean, done?: (err?: Error) => void) {
        this.removeListeners();
        done?.();
    }

    addListener(
        event: string | symbol,
        handler: EventHandler,
        options = { once: false }
    ): void {
        this.listeners.push([event, handler]);

        if (options.once === true) {
            this.emitter.once(event, handler);
        } else {
            this.emitter.on(event, handler);
        }
    }

    addListeners(bind: any, eventsList: EventsList) {
        eventsList.forEach(([event, handler]) => {
            this.emitter.addListener(event, handler.bind(bind));
        });
    }

    removeListeners() {
        this.listeners.forEach(([event, handler]) => {
            this.emitter.removeListener(event, handler);
        });
        this.listeners = [];
    }
}
