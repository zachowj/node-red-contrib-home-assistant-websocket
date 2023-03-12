import HomeAssistant from '../../homeAssistant/HomeAssistant';
import HomeAssistantError, {
    isHomeAssistantApiError,
} from '../errors/HomeAssistantError';
import State from '../State';
import Status from '../status/Status';

export enum IntegrationState {
    Loaded = 'loaded',
    NotLoaded = 'notloaded',
    Unloaded = 'unloaded',
}

export enum IntegrationEvent {
    Trigger = 'trigger',
}

export enum MessageType {
    Discovery = 'nodered/discovery',
    Entity = 'nodered/entity',
    RemoveDevice = 'nodered/device/remove',
    UpdateConfig = 'nodered/entity/update_config',
}

export interface MessageBase {
    type: MessageType;
    server_id: string;
    node_id: string;
}

export interface IntegrationConstructor {
    homeAssistant: HomeAssistant;
    state: State;
}

export default class Integration {
    protected readonly homeAssistant: HomeAssistant;
    public readonly state: State;
    protected status: Status[] = [];

    protected notInstallMessage =
        'Node-RED custom integration needs to be installed in Home Assistant for this node to function correctly.';

    constructor({ homeAssistant, state }: IntegrationConstructor) {
        this.homeAssistant = homeAssistant;
        this.state = state;
    }

    get isConnected(): boolean {
        return this.homeAssistant.isConnected;
    }

    get isIntegrationLoaded(): boolean {
        return this.homeAssistant.isIntegrationLoaded;
    }

    public setStatus(status: Status) {
        this.status.push(status);
    }

    public async sendUpdateConfig(
        serverId: string,
        nodeId: string,
        config: { name?: string; icon?: string; entity_picture?: string }
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
