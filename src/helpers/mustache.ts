/*
 * Modified from https://github.com/node-red/node-red/blob/master/nodes/core/core/80-template.js
 */

import { HassEntities } from 'home-assistant-js-websocket';
import { Context, render } from 'mustache';
import { NodeContext, NodeMessage } from 'node-red';
import selectn from 'selectn';

import { containsMustache } from './utils';

function parseContext(key: string) {
    const match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
    if (match) {
        const parts = {
            type: match[1] as 'flow' | 'global',
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
    readonly #nodeContext: NodeContext;
    readonly #entities: HassEntities;

    constructor(
        view: any,
        parentContext: CustomContext | undefined,
        nodeContext: NodeContext,
        entities: HassEntities
    ) {
        super(view, parentContext);
        this.#nodeContext = nodeContext;
        this.#entities = entities;
    }

    lookup(name: string): string {
        // try message first:
        let value = super.lookup(name);
        if (value === undefined) {
            if (this.#nodeContext) {
                // try flow/global context:
                const context = parseContext(name);
                if (context) {
                    const target = this.#nodeContext[context.type];
                    if (target) {
                        try {
                            value = target.get(context.field, context.store);
                        } catch (err) {}
                    }
                }
            }
            if (value === undefined && this.#entities) {
                // try state entities
                // version 0.10.3 changed from states.domain.entity to entity.d.e
                const match = /^(?:states|entity)\.(\w+\.\w+)(?:\.(.+))?/.exec(
                    name
                );
                if (match) {
                    const entityId = match[1];
                    const path = match[2] ?? 'state';

                    value = selectn(path, this.#entities[entityId]);
                }
            }
        }

        return value ?? '';
    }

    push(view: any) {
        return new CustomContext(view, this, this.#nodeContext, this.#entities);
    }
}

function containsAltMustache(str: string): boolean {
    const regex = /<%(?:(?!%>).+)%>/g;
    return regex.test(str);
}

export function renderTemplate(
    str: string,
    message: NodeMessage,
    nodeContext: NodeContext,
    entities: HassEntities,
    altTags = false
): string {
    if (
        str &&
        ((altTags !== true && containsMustache(str)) ||
            (altTags === true && containsAltMustache(str)))
    ) {
        return render(
            str,
            new CustomContext(message, undefined, nodeContext, entities),
            undefined,
            altTags === true ? ['<%', '%>'] : undefined
        );
    }

    return str ?? '';
}

export function generateRenderTemplate(
    message: NodeMessage,
    context: NodeContext,
    states: HassEntities
) {
    return (template: string, altTags = false) =>
        renderTemplate(template, message, context, states, altTags);
}
