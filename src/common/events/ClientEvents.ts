import EventEmitter from 'events';
import { Node } from 'node-red';

import { ClientEvent } from '../../homeAssistant/Websocket';
import Events from './Events';

export default class ClientEvents extends Events {
    constructor({ node, emitter }: { node: Node; emitter: EventEmitter }) {
        super({ node, emitter });

        this.emitter.on(ClientEvent.Error, this.onHaEventsError.bind(this));
    }

    onHaEventsError(err: Error) {
        if (err?.message) this.node.error(err.message);
    }
}
