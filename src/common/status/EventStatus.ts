import { NodeStatus } from 'node-red';

import { ClientEvent, ClientState } from '../../homeAssistant/Websocket';
import ClientEvents from '../events/ClientEvents';
import Status, { StatusColor, StatusConstructor, StatusShape } from './Status';

export interface EventsStatusConstructor extends StatusConstructor {
    clientEvents: ClientEvents;
}

export default class EventsStatus extends Status {
    #connectionState = ClientState.Disconnected;

    constructor(props: EventsStatusConstructor) {
        super(props);

        props.clientEvents.addListeners(this, [
            [ClientEvent.Close, this.#onClientClose],
            [ClientEvent.Connecting, this.#onClientConnecting],
            [ClientEvent.Error, this.#onClientError],
            [ClientEvent.Open, this.#onClientOpen],
            [ClientEvent.Running, this.#onClientRunning],
        ]);
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
}
