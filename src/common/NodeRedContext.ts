import { Node, NodeContext, NodeMessage } from 'node-red';

import { RED } from '../globals';

export default class NodeRedContext {
    constructor(private readonly node: Node) {
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
        location: 'none' | 'msg' | keyof NodeContext,
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
                if (!message) return;
                RED.util.setObjectProperty(message, key, val);
                break;
            case 'none':
            default:
                break;
        }
    }
}
