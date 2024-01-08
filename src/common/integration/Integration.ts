import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import HomeAssistantError, {
    isHomeAssistantApiError,
} from '../errors/HomeAssistantError';
import ClientEvents from '../events/ClientEvents';
import State from '../State';
import Status from '../status/Status';

export enum IntegrationState {
    Loaded = 'loaded',
    NotLoaded = 'notloaded',
    Unloaded = 'unloaded',
}

export enum IntegrationEvent {
    Trigger = 'trigger',
    ValueChange = 'itegration_value_change',
}

export enum MessageType {
    DeviceAction = 'nodered/device/action',
    DeviceTrigger = 'nodered/device/trigger',
    Discovery = 'nodered/discovery',
    Entity = 'nodered/entity',
    RemoveDevice = 'nodered/device/remove',
    SentenceTrigger = 'nodered/sentence',
    UpdateConfig = 'nodered/entity/update_config',
    Webhook = 'nodered/webhook',
}

export interface MessageBase {
    type: MessageType;
    server_id: string;
    node_id: string;
}

export interface IntegrationConstructor {
    clientEvents: ClientEvents;
    homeAssistant: HomeAssistant;
    state: State;
}

export default abstract class Integration {
    protected readonly clientEvents: ClientEvents;
    protected readonly homeAssistant: HomeAssistant;
    protected notInstalledMessage =
        'Node-RED custom integration needs to be installed in Home Assistant for this node to function correctly.';

    protected registered = false;
    protected status: Status[] = [];

    public readonly state: State;

    constructor({
        clientEvents,
        homeAssistant,
        state,
    }: IntegrationConstructor) {
        this.clientEvents = clientEvents;
        this.homeAssistant = homeAssistant;
        this.state = state;
    }

    async init() {
        this.clientEvents.addListeners(this, [
            [ClientEvent.Close, this.#onHaClose],
            [ClientEvent.Integration, this.#onHaIntegration],
        ]);

        if (this.isIntegrationLoaded) {
            await this.register();
        }
    }

    get isConnected(): boolean {
        return this.homeAssistant.isConnected;
    }

    get isIntegrationLoaded(): boolean {
        return this.homeAssistant.isIntegrationLoaded;
    }

    get isRegistered(): boolean {
        return this.registered;
    }

    #onHaClose() {
        this.registered = false;
    }

    async #onHaIntegration(type: IntegrationState) {
        switch (type) {
            case IntegrationState.Loaded:
                await this.register();
                break;
            case IntegrationState.Unloaded:
            case IntegrationState.NotLoaded:
                this.registered = false;
                break;
        }
    }

    protected abstract register(): Promise<void>;

    protected abstract unregister(): Promise<void>;

    public setStatus(status: Status) {
        this.status.push(status);
    }

    public async sendUpdateConfig(
        serverId: string,
        nodeId: string,
        config: Record<string, string | string[] | number>,
    ) {
        const payload = {
            type: MessageType.UpdateConfig,
            server_id: serverId,
            node_id: nodeId,
            config,
        };
        try {
            await this.homeAssistant.websocket.send(payload);
        } catch (err) {
            if (isHomeAssistantApiError(err)) {
                throw new HomeAssistantError(err, 'home-assistant.error.error');
            }

            throw err;
        }
    }
}
