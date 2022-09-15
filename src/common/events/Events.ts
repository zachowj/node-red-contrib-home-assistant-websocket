import EventEmitter from 'events';
import { Node } from 'node-red';

import { NodeDone } from '../../types/nodes';

export type EventHandler = (...args: any[]) => void;
export type EventsList = [string | symbol, EventHandler][];

export enum NodeEvent {
    Close = 'close',
    On = 'on',
    StateChanged = 'stateChanged',
}

export default class Events {
    #listeners: EventsList = [];
    protected readonly node;
    protected readonly emitter;

    constructor({ node, emitter }: { node: Node; emitter: EventEmitter }) {
        this.node = node;
        this.emitter = emitter;
        emitter.setMaxListeners(0);

        node.on(NodeEvent.Close, this.onClose.bind(this));
    }

    onClose(_removed: boolean, done: NodeDone) {
        this.removeListeners();
        done();
    }

    addListener(
        event: string | symbol,
        handler: EventHandler,
        options = { once: false }
    ): void {
        this.#listeners.push([event, handler]);

        if (options.once === true) {
            this.emitter.once(event, handler);
        } else {
            this.emitter.on(event, handler);
        }
    }

    addListeners(bind: any, eventsList: EventsList) {
        eventsList.forEach(([event, handler]) => {
            this.addListener(event, handler.bind(bind));
        });
    }

    removeListeners() {
        this.#listeners.forEach(([event, handler]) => {
            this.emitter.removeListener(event, handler);
        });
        this.#listeners = [];
    }
}
