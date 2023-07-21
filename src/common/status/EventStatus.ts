import { NodeStatus } from 'node-red';

import { HaEvent } from '../../homeAssistant';
import { ClientEvent, ClientState } from '../../homeAssistant/Websocket';
import { EntityConfigNode } from '../../nodes/entity-config';
import ClientEvents from '../events/ClientEvents';
import Status, { StatusColor, StatusConstructor, StatusShape } from './Status';

interface EventsStatusConstructor extends StatusConstructor {
    clientEvents: ClientEvents;
    exposeAsEntityConfigNode?: EntityConfigNode;
}

export default class EventsStatus extends Status {
    #connectionState = ClientState.Disconnected;
    readonly #exposeAsEntityConfigNode?: EntityConfigNode;

    protected lastStatus: NodeStatus = {};

    constructor(props: EventsStatusConstructor) {
        super(props);
        this.#exposeAsEntityConfigNode = props.exposeAsEntityConfigNode;

        props.clientEvents.addListeners(this, [
            [ClientEvent.Close, this.#onClientClose],
            [ClientEvent.Connecting, this.#onClientConnecting],
            [ClientEvent.Error, this.#onClientError],
            [ClientEvent.Open, this.#onClientOpen],
            [ClientEvent.Running, this.#onClientRunning],
        ]);

        if (this.#exposeAsEntityConfigNode) {
            const exposeAsConfigEvents = new ClientEvents({
                node: this.node,
                emitter: this.#exposeAsEntityConfigNode,
            });

            exposeAsConfigEvents?.addListener(
                HaEvent.StateChanged,
                this.#onStateChange.bind(this)
            );
        }
    }

    get isNodeEnabled(): boolean {
        return this.#exposeAsEntityConfigNode?.state.isEnabled() ?? true;
    }

    #onClientError(): void {
        this.#connectionState = ClientState.Error;
        this.#updateConnectionStatus();
    }

    #onClientClose(): void {
        this.#connectionState = ClientState.Disconnected;
        this.#updateConnectionStatus();
    }

    #onClientConnecting(): void {
        this.#connectionState = ClientState.Connecting;
        this.#updateConnectionStatus();
    }

    #onClientOpen(): void {
        this.#connectionState = ClientState.Connected;
        this.#updateConnectionStatus();
    }

    #onClientRunning(): void {
        this.#connectionState = ClientState.Running;
        this.#updateConnectionStatus();
    }

    #onStateChange() {
        this.updateStatus(this.lastStatus);
    }

    #updateConnectionStatus(): void {
        const status = this.getConnectionStatus();
        this.lastStatus = status;
        this.updateStatus(status);
    }

    protected getConnectionStatus(): NodeStatus {
        const status: NodeStatus = {
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: 'home-assistant.status.disconnected',
        };

        switch (this.#connectionState) {
            case ClientState.Connected:
                status.fill = StatusColor.Green;
                status.text = 'home-assistant.status.connected';
                break;
            case ClientState.Connecting:
                status.fill = StatusColor.Yellow;
                status.text = 'home-assistant.status.connecting';
                break;
            case ClientState.Error:
                status.text = 'home-assistant.status.error';
                break;
            case ClientState.Running:
                status.fill = StatusColor.Green;
                status.text = 'home-assistant.status.running';
                break;
        }

        return status;
    }

    protected updateStatus(status: NodeStatus): void {
        if (this.isNodeEnabled === false) {
            status = {
                fill: StatusColor.Grey,
                shape: StatusShape.Dot,
                text: 'home-assistant.status.disabled',
            };
        }

        this.node.status(status);
    }

    public set(status: NodeStatus = {}): void {
        if (this.isNodeEnabled) {
            this.lastStatus = status;
        }
        this.updateStatus(status);
    }
}
