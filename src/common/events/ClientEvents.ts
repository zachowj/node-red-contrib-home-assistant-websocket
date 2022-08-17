import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { BaseNode } from '../../types/nodes';
import Events from './Events';

export default class ClientEvents extends Events {
    constructor({
        node,
        homeAssistant,
    }: {
        node: BaseNode;
        homeAssistant: HomeAssistant;
    }) {
        super({ node, emitter: homeAssistant.eventBus });

        this.emitter.on(ClientEvent.Error, this.onHaEventsError.bind(this));
    }

    onHaEventsError(err: Error) {
        if (err?.message) this.node.error(err.message);
    }
}
