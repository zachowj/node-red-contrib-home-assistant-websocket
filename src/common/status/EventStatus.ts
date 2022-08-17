import { NodeStatus } from 'node-red';

import { ClientEvent, ClientState } from '../../homeAssistant/Websocket';
import { BaseNode, ServerNodeConfig } from '../../types/nodes';
import ClientEvents from '../events/ClientEvents';
import { Status, StatusColor, StatusShape } from './Status';

export default class EventsStatus extends Status {
    private connectionState = ClientState.Disconnected;

    constructor(
        node: BaseNode,
        config: ServerNodeConfig,
        clientEvents: ClientEvents
    ) {
        super(node, config);

        clientEvents.addListeners(this, [
            [ClientEvent.Close, this.onClientClose],
            [ClientEvent.Connecting, this.onClientConnecting],
            [ClientEvent.Error, this.onClientError],
            [ClientEvent.Open, this.onClientOpen],
            [ClientEvent.Running, this.onClientRunning],
        ]);
    }

    init({ nodeState }: { nodeState: boolean }): void {
        if (nodeState !== undefined) {
            this.isNodeDisabled = !nodeState;
        }
    }

    onClientClose(): void {
        this.connectionState = ClientState.Disconnected;
        this.updateConnectionStatus();
    }

    onClientConnecting(): void {
        this.connectionState = ClientState.Connecting;
        this.updateConnectionStatus();
    }

    onClientError(): void {
        this.connectionState = ClientState.Error;
        this.updateConnectionStatus();
    }

    onClientOpen(): void {
        this.connectionState = ClientState.Connected;
        this.updateConnectionStatus();
    }

    onClientRunning(): void {
        this.connectionState = ClientState.Running;
        this.updateConnectionStatus();
    }

    updateConnectionStatus(): void {
        const status = this.getConnectionStatus();
        this.updateStatus(status);
    }

    getConnectionStatus(): NodeStatus {
        const status: NodeStatus = {
            fill: StatusColor.Red,
            shape: StatusShape.Ring,
            text: 'config-server.status.disconnected',
        };

        switch (this.connectionState) {
            case ClientState.Connected:
                status.fill = StatusColor.Green;
                status.text = 'config-server.status.connected';
                break;
            case ClientState.Connecting:
                status.fill = StatusColor.Yellow;
                status.text = 'config-server.status.connecting';
                break;
            case ClientState.Error:
                status.text = 'config-server.status.error';
                break;
            case ClientState.Running:
                status.fill = StatusColor.Green;
                status.text = 'config-server.status.running';
                break;
        }

        return status;
    }
}
