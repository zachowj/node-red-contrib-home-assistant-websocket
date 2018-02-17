'use strict';
var assert = require('assert');

class Context {
    constructor(type) {
        this._values = {};
        this._type = type;
    }
    get(key) {
        return this._values[key];
    }
    set(key, value) {
        console.log(this._type + ' context: set [' + key + '] => [' + value + ']');
        this._values[key] = value;
    }
}

class MockNode {
    constructor() {
        this._events  = {};
        this._state   = {};
        this._sent    = [];
        this._context = {};
        this._status  = {};
    }

    log()   { console.log(...arguments); }
    warn()  { console.log(...arguments); }
    error() { console.log(...arguments); }
    on(event, eventFn) {
        this._events[event] = eventFn;
    }
    emit(event, data) {
        this._events[event].call(this, data);
    }
    status(status) {
        if (status) this._status = status;
        return status;
    }
    send(msg) {
        this._sent.push(msg);
    }
    sent(index) {
        return this._sent[index];
    }
    context() {
        return this._context;
    }
}

module.exports = function(nodeRedModule, config) {
    const RED = {
        nodes: {
            getNode:      () => {},
            registerType: function(nodeName, nodeConfigFunc) {
                this.nodeConfigFunc = nodeConfigFunc;
            },
            createNode: function() {
                // TODO write me
            }
        },
        settings: {
            get: () => {}
        },
        comms: {
            publish: () => true
        }
    };
    const mockNode = new MockNode();
    // Register the node (calls registerType)
    nodeRedModule(RED);
    return new RED.nodes.nodeConfigFunc.call(mockNode, config);    // eslint-disable-line
};
