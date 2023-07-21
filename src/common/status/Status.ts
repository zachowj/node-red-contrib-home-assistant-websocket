import { NodeStatus } from 'node-red';

import { RED } from '../../globals';
import { formatDate } from '../../helpers/date';
import { BaseNode, ServerNodeConfig } from '../../types/nodes';
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

export interface StatusConstructor<T extends BaseNode = BaseNode> {
    config: ServerNodeConfig;
    node: T;
}

export default class Status<T extends BaseNode = BaseNode> {
    protected readonly config: ServerNodeConfig;
    protected readonly node: T;

    constructor(props: StatusConstructor<T>) {
        this.config = props.config;
        this.node = props.node;
    }

    protected updateStatus(status: NodeStatus): void {
        this.node.status(status);
    }

    protected appendDateString(text: string): string {
        const separator = this.config?.statusSeparator ?? '';
        const dateString = formatDate({
            options: getStatusOptions(this.config),
        });

        // Translate now because text is not translated in the template
        return `${RED._(`${text}`)} ${separator}${dateString}`;
    }

    public set(status: NodeStatus = {}): void {
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
}
