import { NodeStatus } from 'node-red';

import { RED } from '../../globals';
import { formatDate } from '../../helpers/date';
import { i18nKeyandParams } from '../../types/i18n';
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

    protected get dateString(): string {
        const separator = this.config?.statusSeparator ?? '';
        const date = formatDate({
            options: getStatusOptions(this.config),
        });

        return `${separator}${date}`;
    }

    protected translatedText(data: i18nKeyandParams): string {
        const [key, params] = Array.isArray(data) ? data : [data, undefined];
        const message = RED._(key, params);

        return `${message} ${this.dateString}`;
    }

    protected updateStatus(status: NodeStatus): void {
        this.node.status(status);
    }

    public set(status: NodeStatus = {}): void {
        this.updateStatus(status);
    }

    public setText(text = ''): void {
        this.set({ text });
    }

    public setError(
        text: i18nKeyandParams = 'home-assistant.status.error'
    ): void {
        this.set({
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: this.translatedText(text),
        });
    }

    public setFailed(
        text: i18nKeyandParams = 'home-assistant.status.failed'
    ): void {
        this.set({
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: this.translatedText(text),
        });
    }

    public setSending(
        text: i18nKeyandParams = 'home-assistant.status.sending'
    ): void {
        this.set({
            fill: StatusColor.Yellow,
            shape: StatusShape.Dot,
            text: this.translatedText(text),
        });
    }

    public setSuccess(
        text: i18nKeyandParams = 'home-assistant.status.success'
    ): void {
        this.set({
            fill: StatusColor.Green,
            shape: StatusShape.Dot,
            text: this.translatedText(text),
        });
    }
}
