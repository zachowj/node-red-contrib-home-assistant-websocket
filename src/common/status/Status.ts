import { NodeStatus } from 'node-red';

import { RED } from '../../globals';
import { formatDate } from '../../helpers/date';
import { BaseNode, ServerNodeConfig } from '../../types/nodes';
import Events, { NodeEvent } from '../events/Events';
import State from '../State';
import { getStatusOptions } from './helpers';

export enum StatusColor {
    Blue = 'blue',
    Green = 'green',
    Grey = 'grey',
    Red = 'red',
    Yellow = 'yellow',
}

export enum StatusShape {
    Dot = 'dot',
    Ring = 'ring',
}

export interface StatusConstructorProps {
    config: ServerNodeConfig;
    nodeEvents: Events;
    node: BaseNode;
    state: State;
}

export default class Status {
    protected readonly config: ServerNodeConfig;
    protected readonly nodeEvents: Events;
    protected readonly node: BaseNode;
    protected readonly nodeState: State;

    protected lastStatus: NodeStatus = {};

    constructor(props: StatusConstructorProps) {
        this.config = props.config;
        this.nodeEvents = props.nodeEvents;
        this.node = props.node;
        this.nodeState = props.state;

        this.nodeEvents.addListener(
            NodeEvent.StateChanged,
            this.onNodeStateChange.bind(this)
        );
    }

    get isNodeEnabled(): boolean {
        return this.nodeState.isEnabled();
    }

    get isNodeDisabled(): boolean {
        return this.nodeState.isEnabled() === false;
    }

    protected onNodeStateChange() {
        this.updateStatus(this.lastStatus);
    }

    public set(status: NodeStatus = {}): void {
        if (this.isNodeEnabled) {
            this.lastStatus = status;
        }
        this.updateStatus(status);
    }

    public setText(text = ''): void {
        this.set({ text });
    }

    public setSuccess(text = 'home-assistant.status.success'): void {
        this.set({
            fill: StatusColor.Green,
            shape: StatusShape.Dot,
            text: this.appendDateString(text),
        });
    }

    public setSending(text = 'home-assistant.status.sending'): void {
        this.set({
            fill: StatusColor.Yellow,
            shape: StatusShape.Dot,
            text: this.appendDateString(text),
        });
    }

    public setFailed(text = 'home-assistant.status.failed'): void {
        this.set({
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: this.appendDateString(text),
        });
    }

    protected updateStatus(status: NodeStatus): void {
        if (this.isNodeDisabled) {
            status = {
                fill: StatusColor.Grey,
                shape: StatusShape.Dot,
                text: 'home-assistant.status.disabled',
            };
        }

        this.node.status(status);
    }

    protected appendDateString(text: string): string {
        const separator = this.config?.statusSeparator ?? '';
        const dateString = formatDate({
            options: getStatusOptions(this.config),
        });

        return `${RED._(`${text}`)} ${separator}${dateString}`;
    }
}
