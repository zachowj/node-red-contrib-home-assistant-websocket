const {
    STATE_CONNECTED,
    STATE_CONNECTING,
    STATE_DISCONNECTED,
    STATE_ERROR,
    STATE_RUNNING,
} = require('../const');

const STATUS_COLOR_BLUE = 'blue';
const STATUS_COLOR_GREEN = 'green';
const STATUS_COLOR_GREY = 'grey';
const STATUS_COLOR_RED = 'red';
const STATUS_COLOR_YELLOW = 'yellow';
const STATUS_SHAPE_DOT = 'dot';
const STATUS_SHAPE_RING = 'ring';

class Status {
    constructor({ node, nodeState = true }) {
        this.node = node;
        this.isNodeDisabled = !nodeState;
        this.lastStatus = {};
    }

    setNodeState(value) {
        if (this.isNodeDisabled === value) {
            this.isNodeDisabled = !value;
            this.updateStatus(this.lastStatus);
        }
    }

    set({
        fill = STATUS_COLOR_BLUE,
        shape = STATUS_SHAPE_DOT,
        text = '',
    } = {}) {
        const status = {
            fill,
            shape,
            text,
        };
        if (this.isNodeDisabled === false) {
            this.lastStatus = status;
        }
        this.updateStatus(status);
    }

    setText(text = '') {
        this.set({ fill: null, shape: null, text });
    }

    setSuccess(text = 'Success') {
        this.set({
            fill: STATUS_COLOR_GREEN,
            shape: STATUS_SHAPE_DOT,
            text: this.appendDateString(text),
        });
    }

    setSending(text = 'Sending') {
        this.set({
            fill: STATUS_COLOR_YELLOW,
            shape: STATUS_SHAPE_DOT,
            text: this.appendDateString(text),
        });
    }

    setFailed(text = 'Failed') {
        this.set({
            fill: STATUS_COLOR_RED,
            shape: STATUS_SHAPE_RING,
            text: this.appendDateString(text),
        });
    }

    updateStatus(status) {
        if (this.isNodeDisabled) {
            status = {
                fill: STATUS_COLOR_GREY,
                shape: STATUS_SHAPE_DOT,
                text: 'config-server.status.disabled',
            };
        }

        this.node.status(status);
    }

    appendDateString(text) {
        return `${text} at: ${this.getPrettyDate()}`;
    }

    destroy() {}

    getPrettyDate() {
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
        });
    }
}

class EventsStatus extends Status {
    constructor({ node, nodeState, homeAssistant }) {
        super({ node, nodeState });
        this.connectionState = STATE_DISCONNECTED;
        this.eventListeners = [];

        if (homeAssistant) {
            this.enableConnectionStatus(homeAssistant);
        }
    }

    enableConnectionStatus(homeAssistant) {
        // Setup event listeners
        const events = {
            'ha_client:close': this.onClientClose,
            'ha_client:connecting': this.onClientConnecting,
            'ha_client:error': this.onClientError,
            'ha_client:open': this.onClientOpen,
            'ha_client:running': this.onClientRunning,
        };

        Object.entries(events).forEach(([event, callback]) => {
            this.eventListeners.push(() =>
                homeAssistant.removeListener(event, callback)
            );
            homeAssistant.addListener(event, callback.bind(this));
        });
    }

    onClientClose() {
        this.connectionState = STATE_DISCONNECTED;
        this.updateConnectionStatus();
    }

    onClientConnecting() {
        this.connectionState = STATE_CONNECTING;
        this.updateConnectionStatus();
    }

    onClientError() {
        this.connectionState = STATE_ERROR;
        this.updateConnectionStatus();
    }

    onClientOpen() {
        this.connectionState = STATE_CONNECTED;
        this.updateConnectionStatus();
    }

    onClientRunning() {
        this.connectionState = STATE_RUNNING;
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const status = this.getConnectionStatus();
        this.updateStatus(status);
    }

    getConnectionStatus() {
        const status = {
            fill: STATUS_COLOR_RED,
            shape: STATUS_SHAPE_RING,
            text: 'config-server.status.disconnected',
        };

        switch (this.connectionState) {
            case STATE_CONNECTED:
                status.fill = STATUS_COLOR_GREEN;
                status.text = 'config-server.status.connected';
                break;
            case STATE_CONNECTING:
                status.fill = STATUS_COLOR_YELLOW;
                status.text = 'config-server.status.connecting';
                break;
            case STATE_ERROR:
                status.text = 'config-server.status.error';
                break;
            case STATE_RUNNING:
                status.fill = STATUS_COLOR_GREEN;
                status.text = 'config-server.status.running';
                break;
        }

        return status;
    }

    destroy() {
        this.eventListeners.forEach((callback) => callback());
    }
}

class SwitchEntityStatus extends Status {
    constructor({ node, nodeState }) {
        super({ node, nodeState });
    }

    set({
        fill = STATUS_COLOR_YELLOW,
        shape = STATUS_SHAPE_DOT,
        text = '',
    } = {}) {
        const status = {
            fill,
            shape,
            text,
        };
        super.set(status);
    }

    setNodeState(value) {
        this.isNodeDisabled = !value;

        const status = {
            fill: STATUS_COLOR_YELLOW,
            shape: value ? STATUS_SHAPE_DOT : STATUS_SHAPE_RING,
            text: this.appendDateString(value ? 'on' : 'off'),
        };

        this.updateStatus(status);
    }

    updateStatus(status) {
        this.node.status(status);
    }
}

module.exports = {
    EventsStatus,
    Status,
    SwitchEntityStatus,
    STATUS_COLOR_BLUE,
    STATUS_COLOR_GREEN,
    STATUS_COLOR_GREY,
    STATUS_COLOR_RED,
    STATUS_COLOR_YELLOW,
    STATUS_SHAPE_DOT,
    STATUS_SHAPE_RING,
};
