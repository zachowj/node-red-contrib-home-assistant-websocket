import { Node, NodeStatus } from 'node-red';

import { formatDate } from '../../helpers/date';
import { DateTimeFormatOptions } from '../../types/DateTimeFormatOptions';
import { BaseNode, ServerNodeConfig } from '../../types/nodes';

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

export class Status {
    protected isNodeDisabled = false;
    protected lastStatus: NodeStatus = {};
    protected readonly node: Node;
    protected readonly config: ServerNodeConfig;

    constructor(node: BaseNode, config: ServerNodeConfig) {
        this.node = node;
        this.config = config;
    }

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
            fill: StatusColor.Green,
            shape: StatusShape.Dot,
            text: this.appendDateString(text),
        });
    }

    setSending(text = 'Sending'): void {
        this.set({
            fill: StatusColor.Yellow,
            shape: StatusShape.Dot,
            text: this.appendDateString(text),
        });
    }

    setFailed(text = 'Failed'): void {
        this.set({
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: this.appendDateString(text),
        });
    }

    updateStatus(status: NodeStatus): void {
        if (this.isNodeDisabled) {
            status = {
                fill: StatusColor.Grey,
                shape: StatusShape.Dot,
                text: 'config-server.status.disabled',
            };
        }

        this.node.status(status);
    }

    appendDateString(text: string): string {
        const separator = this.config?.statusSeparator ?? '';
        const dateString = formatDate({
            options: this.statusOptions(),
        });

        return `${text} ${separator}${dateString}`;
    }

    statusOptions(): DateTimeFormatOptions {
        const config = this.config;

        const options: DateTimeFormatOptions = {
            year:
                config?.statusYear === 'hidden'
                    ? undefined
                    : config?.statusYear,
            month:
                config?.statusMonth === 'hidden'
                    ? undefined
                    : config?.statusMonth ?? 'short',
            day:
                config?.statusDay === 'hidden'
                    ? undefined
                    : config?.statusDay ?? 'numeric',
            hourCycle:
                config?.statusHourCycle === 'default'
                    ? undefined
                    : config?.statusHourCycle ?? 'h23',
            hour: 'numeric',
            minute: 'numeric',
        };

        switch (config?.statusTimeFormat) {
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
