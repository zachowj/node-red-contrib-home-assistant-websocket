import { NodeStatus } from 'node-red';

import { RED } from '../../globals';
import { ClientEvent, ClientState } from '../../homeAssistant/Websocket';
import ClientEvents from '../events/ClientEvents';
import Status, {
    StatusColor,
    StatusConstructorProps,
    StatusShape,
} from './Status';

interface EventsStatusConstructorProps extends StatusConstructorProps {
    clientEvents: ClientEvents;
}

export default class EventsStatus extends Status {
    #connectionState = ClientState.Disconnected;

    constructor(props: EventsStatusConstructorProps) {
        super(props);

        props.clientEvents.addListeners(this, [
            [ClientEvent.Close, this.#onClientClose],
            [ClientEvent.Connecting, this.#onClientConnecting],
            [ClientEvent.Error, this.#onClientError],
            [ClientEvent.Open, this.#onClientOpen],
            [ClientEvent.Running, this.#onClientRunning],
        ]);
    }

    #onClientClose(): void {
        this.#connectionState = ClientState.Disconnected;
        this.#updateConnectionStatus();
    }

    #onClientConnecting(): void {
        this.#connectionState = ClientState.Connecting;
        this.#updateConnectionStatus();
    }

    #onClientError(): void {
        this.#connectionState = ClientState.Error;
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

    #updateConnectionStatus(): void {
        const status = this.#getConnectionStatus();
        status.text = RED._(`${status.text}`);
        this.lastStatus = status;
        this.updateStatus(status);
    }

    #getConnectionStatus(): NodeStatus {
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
}
