import EventEmitter from 'events';

import { ClientEvent } from '../../homeAssistant/Websocket';
import { BaseNode } from '../../types/nodes';
import Events from './Events';

export default class ClientEvents extends Events {
    constructor({ node, emitter }: { node: BaseNode; emitter: EventEmitter }) {
        super({ node, emitter });

        this.emitter.on(ClientEvent.Error, this.onHaEventsError.bind(this));
    }

    onHaEventsError(err: Error) {
        if (err?.message) this.node.error(err.message);
    }
}
