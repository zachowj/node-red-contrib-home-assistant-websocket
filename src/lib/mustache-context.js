/*
 * Modified from https://github.com/node-red/node-red/blob/master/nodes/core/core/80-template.js
 */

const mustache = require('mustache');
const selectn = require('selectn');

const { toCamelCase } = require('./utils');

function parseContext(key) {
    const match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
    if (match) {
        const parts = {};
        parts.type = match[1];
        parts.store = match[3] === '' ? 'default' : match[3];
        parts.field = match[4];
        return parts;
    }
    return undefined;
}

/**
 * Custom Mustache Context capable to collect message property and node
 * flow and global context
 */

function NodeContext(msg, parent, nodeContext, serverName) {
    this.msgContext = new mustache.Context(msg, parent);
    this.nodeContext = nodeContext;
    this.serverName = serverName;
}

NodeContext.prototype = new mustache.Context();

NodeContext.prototype.lookup = function (name) {
    // try message first:
    const value = this.msgContext.lookup(name);
    if (value !== undefined) {
        return value;
    }

    // try flow/global context:
    const context = parseContext(name);
    if (context) {
        const type = context.type;
        const store = context.store;
        const field = context.field;
        const target = this.nodeContext[type];
        if (target) {
            try {
                return target.get(field, store);
            } catch (err) {}
        }
    }

    // try state entities
    // version 0.10.3 changed from states.domain.entity to entity.d.e
    const match = /^(?:states|entity)\.(\w+\.\w+)(?:\.(.+))?/.exec(name);
    if (match) {
        const gHomeAssistant = this.nodeContext.global.get('homeassistant');
        const states = gHomeAssistant[this.serverName].states;
        const entityId = match[1];
        const path = match[2] || 'state';

        return selectn(path, states[entityId]) || '';
    }

    return '';
};

NodeContext.prototype.push = function push(view) {
    return new NodeContext(
        view,
        this.nodeContext,
        this.msgContext,
        this.serverName
    );
};

function RenderTemplate(data, message, context, serverName, altTags = false) {
    const template = data || '';

    if (
        (altTags !== true && template.indexOf('{{') !== -1) ||
        (altTags === true && template.indexOf('<%') !== -1)
    ) {
        return mustache.render(
            data,
            new NodeContext(message, null, context, toCamelCase(serverName)),
            null,
            altTags === true ? ['<%', '%>'] : null
        );
    }

    return data;
}

module.exports = RenderTemplate;
