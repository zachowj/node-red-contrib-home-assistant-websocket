import { Credentials } from 'homeAssistant';
import { NodeStatus } from 'node-red';
import { BaseNode, ServerNode, ServerNodeConfig } from 'types/nodes';

import {
    STATE_CONNECTED,
    STATE_CONNECTING,
    STATE_DISCONNECTED,
    STATE_ERROR,
    STATE_RUNNING,
} from '../const';
import { RED } from '../globals';
import HomeAssistant from '../homeAssistant/HomeAssistant';
import { DateTimeFormatOptions } from '../types/DateTimeFormatOptions';
import { formatDate } from './date';

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
    serverConfig: ServerNodeConfig;

    constructor(readonly node: BaseNode) {
        const serverId = this.node?.config?.server as unknown as string;
        const server = RED.nodes.getNode(serverId) as ServerNode<Credentials>;
        this.serverConfig = server?.config ?? {};
    }

    // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-empty-function
    init({} = {}): void {}

    setNodeState(value: boolean): void {
        if (this.isNodeDisabled === value) {
            this.isNodeDisabled = !value;
            this.updateStatus(this.lastStatus);
        }
    }

    set(status: NodeStatus = {}): void {
        if (this.isNodeDisabled === false) {
            this.lastStatus = status;
        }
        this.updateStatus(status);
    }

    setText(text = ''): void {
        this.set({ text });
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
        const separator = this.serverConfig.statusSeparator ?? '';
        const dateString = formatDate({
            options: this.statusOptions(),
        });

        return `${text} ${separator}${dateString}`;
    }

    statusOptions(): DateTimeFormatOptions {
        const config = this.serverConfig;

        const options: DateTimeFormatOptions = {
            year:
                config.statusYear === 'hidden' ? undefined : config.statusYear,
            month:
                config.statusMonth === 'hidden'
                    ? undefined
                    : config.statusMonth ?? 'short',
            day:
                config.statusDay === 'hidden'
                    ? undefined
                    : config.statusDay ?? 'numeric',
            hourCycle:
                config.statusHourCycle === 'default'
                    ? undefined
                    : config.statusHourCycle ?? 'h23',
            hour: 'numeric',
            minute: 'numeric',
        };

        switch (config.statusTimeFormat) {
            case 'h:m:s':
                options.second = 'numeric';
                break;
            case 'h:m:s.ms':
                options.second = 'numeric';
                options.fractionalSecondDigits = 3;
                break;
        }

        return options;
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
