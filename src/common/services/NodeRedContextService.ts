import { Node, NodeContext, NodeMessage } from 'node-red';

import { RED } from '../../globals';

export enum ContextLocation {
    Msg = 'msg',
    Flow = 'flow',
    Global = 'global',
}

export const isContextLocation = (
    location: string | ContextLocation
): location is ContextLocation => {
    return Object.values(ContextLocation).includes(location as ContextLocation);
};

export default class NodeRedContextService {
    private readonly node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    get(
        location: keyof NodeContext | 'msg',
        property: string,
        message?: NodeMessage
    ) {
        if (location === 'msg') {
            if (!message) return;
            return RED.util.getMessageProperty(message, property);
        }

        const { key, store } = RED.util.parseContextStore(property);
        const context = this.node.context();

        switch (location) {
            case 'flow':
                return context.flow.get(key, store);
            case 'global':
                return context.global.get(key, store);
        }
    }

    set(
        val: any,
        location: ContextLocation,
        property: string,
        message?: NodeMessage
    ) {
        const { key, store } = RED.util.parseContextStore(property);

        switch (location) {
            case 'flow':
            case 'global':
                this.node.context()[location].set(key, val, store);
                break;
            case 'msg':
                if (message) {
                    RED.util.setObjectProperty(message, key, val);
                }
                break;
        }
    }
}
