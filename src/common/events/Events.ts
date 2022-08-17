import EventEmitter from 'events';

import { BaseNode } from '../../types/nodes';

export type EventHandler = (...args: any[]) => void;
export type EventsList = [string, EventHandler][];

export default class Events {
    listeners: EventsList = [];
    protected readonly node;
    protected readonly emitter;

    constructor({ node, emitter }: { node: BaseNode; emitter: EventEmitter }) {
        this.node = node;
        this.emitter = emitter;

        this.node.on('close', this.removeListeners);
    }

    addListener(
        event: string,
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
