import { NodeStatus } from 'node-red';

import Events, { NodeEvent } from '../../common/events/Events';
import Status, {
    StatusColor,
    StatusConstructor,
    StatusShape,
} from '../../common/status/Status';
import { RED } from '../../globals';
import { EntityConfigNode } from '../../nodes/entity-config';
import { SwitchNode } from '../../nodes/switch';

interface SwitchStatusConstructor extends StatusConstructor<SwitchNode> {
    entityConfigNode: EntityConfigNode;
    entityConfigEvents: Events;
}

export default class SwitchStatus extends Status<SwitchNode> {
    #entityConfigNode: EntityConfigNode;

    constructor(props: SwitchStatusConstructor) {
        super(props);
        this.#entityConfigNode = props.entityConfigNode;

        props.entityConfigEvents.addListener(
            NodeEvent.StateChanged,
            this.onNodeStateChange.bind(this)
        );
    }

    get #isSwitchOn(): boolean {
        return this.#entityConfigNode.state.isEnabled();
    }

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
            shape: this.#isSwitchOn ? StatusShape.Dot : StatusShape.Ring,
            text: this.#isSwitchOn
                ? 'home-assistant.status.on'
                : 'home-assistant.status.off',
        };
        if (this.node.config.outputOnStateChange) {
            status.fill = StatusColor.Blue;
            status.text = RED._('home-assistant.status.state_change');
        }
        if (status.text) {
            status.text = this.appendDateString(status.text);
        }
        this.updateStatus(status);
    }

    // Overload the default updateStatus() method because there is no need to show disabled status
    protected updateStatus(status: NodeStatus | string): void {
        this.node.status(status);
    }
}
