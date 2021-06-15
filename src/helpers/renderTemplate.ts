/*
 * Modified from https://github.com/node-red/node-red/blob/master/nodes/core/core/80-template.js
 */

import { HassEntities } from 'home-assistant-js-websocket';
import { Context, render } from 'mustache';
import { NodeContext as NodeRedNodeContext, NodeMessage } from 'node-red';
import selectn from 'selectn';

function parseContext(key: string) {
    const match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
    if (match) {
        const parts = {
            type: match[1],
            store: match[3] === '' ? 'default' : match[3],
            field: match[4],
        };

        return parts;
    }
    return undefined;
}

/**
 * Custom Mustache Context capable to collect message property and node
 * flow and global context
 */

class CustomContext extends Context {
    constructor(
        view: any,
        parentContext: CustomContext | undefined,
        private entities: HassEntities,
        private nodeRedContext?: NodeRedNodeContext
    ) {
        super(view, parentContext);
    }

    lookup(name: string): string {
        // try message first:
        let value = super.lookup(name);
        if (value === undefined) {
            if (this.nodeRedContext) {
                // try flow/global context:
                const context = parseContext(name);
                if (context) {
                    const type = context.type as 'flow' | 'global';
                    const store = context.store;
                    const field = context.field;
                    const target = this.nodeRedContext[type];
                    if (target) {
                        try {
                            value = target.get(field, store) as string;
                        } catch (err) {}
                    }
                }
            }
            if (value === undefined && this.entities) {
                // try state entities
                // version 0.10.3 changed from states.domain.entity to entity.d.e
                const match = /^(?:states|entity)\.(\w+\.\w+)(?:\.(.+))?/.exec(
                    name
                );
                if (match) {
                    const entityId = match[1];
                    const path = match[2] ?? 'state';

                    value = selectn(path, this.entities[entityId]);
                }
            }
        }

        return value ?? '';
    }

    push(view: any) {
        return new CustomContext(
            view,
            this,
            this.entities,
            this.nodeRedContext
        );
    }
}

export function renderTemplate(
    str: string,
    message: NodeMessage,
    nodeRedContext: NodeRedNodeContext,
    entities: HassEntities,
    altTags = false
): string {
    if (
        str &&
        ((altTags !== true && str.indexOf('{{') !== -1) ||
            (altTags === true && str.indexOf('<%') !== -1))
    ) {
        return render(
            str,
            new CustomContext(message, undefined, entities, nodeRedContext),
            undefined,
            altTags === true ? ['<%', '%>'] : undefined
        );
    }

    return str ?? '';
}
