import { NodeStatus } from 'node-red';

import Status, { StatusColor, StatusShape } from './Status';

export default class SwitchEntityStatus extends Status {
    public set({
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

    protected onNodeStateChange() {
        const status: NodeStatus = {
            fill: StatusColor.Yellow,
            shape: this.isNodeEnabled ? StatusShape.Dot : StatusShape.Ring,
            text: this.appendDateString(
                this.isNodeEnabled
                    ? 'home-assistant.status.on'
                    : 'home-assistant.status.off'
            ),
        };

        this.updateStatus(status);
    }

    protected updateStatus(status: NodeStatus | string): void {
        this.node.status(status);
    }
}
