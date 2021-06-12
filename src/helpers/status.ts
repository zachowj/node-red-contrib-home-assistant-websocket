import { Node, NodeStatus } from 'node-red';

import {
    STATE_CONNECTED,
    STATE_CONNECTING,
    STATE_DISCONNECTED,
    STATE_ERROR,
    STATE_RUNNING,
} from '../const';
import HomeAssistant from '../homeAssistant/HomeAssistant';

export const STATUS_COLOR_BLUE = 'blue';
export const STATUS_COLOR_GREEN = 'green';
export const STATUS_COLOR_GREY = 'grey';
export const STATUS_COLOR_RED = 'red';
export const STATUS_COLOR_YELLOW = 'yellow';
export const STATUS_SHAPE_DOT = 'dot';
export const STATUS_SHAPE_RING = 'ring';

export class Status {
    protected isNodeDisabled = false;
    private lastStatus: NodeStatus = {};

    // eslint-disable-next-line no-useless-constructor
    constructor(readonly node: Node) {}

    // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-empty-function
    init({} = {}): void {}

    setNodeState(value: boolean): void {
        if (this.isNodeDisabled === value) {
            this.isNodeDisabled = !value;
            this.updateStatus(this.lastStatus);
        }
    }

    set({
        fill = STATUS_COLOR_BLUE,
        shape = STATUS_SHAPE_DOT,
        text = '',
    }: NodeStatus = {}): void {
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

    setText(text = ''): void {
        this.set({ fill: undefined, shape: undefined, text });
    }

    setSuccess(text = 'Success'): void {
        this.set({
            fill: STATUS_COLOR_GREEN,
            shape: STATUS_SHAPE_DOT,
            text: this.appendDateString(text),
        });
    }

    setSending(text = 'Sending'): void {
        this.set({
            fill: STATUS_COLOR_YELLOW,
            shape: STATUS_SHAPE_DOT,
            text: this.appendDateString(text),
        });
    }

    setFailed(text = 'Failed'): void {
        this.set({
            fill: STATUS_COLOR_RED,
            shape: STATUS_SHAPE_RING,
            text: this.appendDateString(text),
        });
    }

    updateStatus(status: NodeStatus): void {
        if (this.isNodeDisabled) {
            status = {
                fill: STATUS_COLOR_GREY,
                shape: STATUS_SHAPE_DOT,
                text: 'config-server.status.disabled',
            };
        }

        this.node.status(status);
    }

    appendDateString(text: string): string {
        return `${text} at: ${this.getPrettyDate()}`;
    }

    getPrettyDate(): string {
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
        });
    }
}

export class EventsStatus extends Status {
    private connectionState = STATE_DISCONNECTED;
    private eventListeners: { (): void }[] = [];

    init({
        nodeState,
        homeAssistant,
    }: {
        nodeState: boolean;
        homeAssistant: HomeAssistant;
    }): void {
        if (nodeState !== undefined) {
            this.isNodeDisabled = !nodeState;
        }

        if (homeAssistant) {
            this.enableConnectionStatus(homeAssistant);
        }
    }

    enableConnectionStatus(homeAssistant: HomeAssistant): void {
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

    onClientClose(): void {
        this.connectionState = STATE_DISCONNECTED;
        this.updateConnectionStatus();
    }

    onClientConnecting(): void {
        this.connectionState = STATE_CONNECTING;
        this.updateConnectionStatus();
    }

    onClientError(): void {
        this.connectionState = STATE_ERROR;
        this.updateConnectionStatus();
    }

    onClientOpen(): void {
        this.connectionState = STATE_CONNECTED;
        this.updateConnectionStatus();
    }

    onClientRunning(): void {
        this.connectionState = STATE_RUNNING;
        this.updateConnectionStatus();
    }

    updateConnectionStatus(): void {
        const status = this.getConnectionStatus();
        this.updateStatus(status);
    }

    getConnectionStatus(): NodeStatus {
        const status: NodeStatus = {
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

    destroy(): void {
        this.eventListeners.forEach((callback) => callback());
    }
}

export class SwitchEntityStatus extends Status {
    set({
        fill = STATUS_COLOR_YELLOW,
        shape = STATUS_SHAPE_DOT,
        text = '',
    }: NodeStatus = {}): void {
        const status = {
            fill,
            shape,
            text,
        };
        super.set(status);
    }

    setNodeState(value: boolean): void {
        this.isNodeDisabled = !value;

        const status: NodeStatus = {
            fill: STATUS_COLOR_YELLOW,
            shape: value ? STATUS_SHAPE_DOT : STATUS_SHAPE_RING,
            text: this.appendDateString(value ? 'on' : 'off'),
        };

        this.updateStatus(status);
    }

    updateStatus(status: NodeStatus | string): void {
        this.node.status(status);
    }
}
