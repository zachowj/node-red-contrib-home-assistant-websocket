/*
 * Modified from https://github.com/node-red/node-red/blob/master/nodes/core/core/80-template.js
 */

const mustache = require('mustache');
const selectn = require('selectn');

function parseContext(key) {
    var match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
    if (match) {
        var parts = {};
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

NodeContext.prototype.lookup = function(name) {
    // try message first:
    try {
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
        const match = /^states\.(\w+\.\w+)(?:\.(.+))?/.exec(name);
        if (match) {
            const gHomeAssistant = this.nodeContext.global.get('homeassistant');
            const states = gHomeAssistant[this.serverName].states;
            const entityId = match[1];
            const path = match[2] || 'state';

            return selectn(path, states[entityId]) || '';
        }

        return '';
    } catch (err) {
        throw err;
    }
};

NodeContext.prototype.push = function push(view) {
    return new NodeContext(
        view,
        this.nodeContext,
        this.msgContext,
        this.serverName
    );
};

function RenderTemplate(data, message, context, serverName) {
    return (data || '').indexOf('{{') !== -1
        ? mustache.render(
              data,
              new NodeContext(message, null, context, serverName)
          )
        : data;
}

module.exports = RenderTemplate;
