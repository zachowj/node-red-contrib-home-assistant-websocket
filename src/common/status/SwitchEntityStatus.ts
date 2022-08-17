import { NodeStatus } from 'node-red';

import { Status, StatusColor, StatusShape } from './Status';

export default class SwitchEntityStatus extends Status {
    set({
        fill = StatusColor.Yellow,
        shape = StatusShape.Dot,
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
            fill: StatusColor.Yellow,
            shape: value ? StatusShape.Dot : StatusShape.Ring,
            text: this.appendDateString(value ? 'on' : 'off'),
        };

        this.updateStatus(status);
    }

    updateStatus(status: NodeStatus | string): void {
        this.node.status(status);
    }
}
