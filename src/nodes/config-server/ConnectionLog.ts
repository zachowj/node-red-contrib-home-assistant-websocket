import ClientEvents from '../../common/events/ClientEvents';
import { NodeEvent } from '../../common/events/Events';
import { IntegrationState } from '../../common/integration/Integration';
import { Credentials, SUPERVISOR_URL } from '../../homeAssistant';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { NodeDone, ServerNode } from '../../types/nodes';

export default class ConnectionLog {
    readonly #hostname: string;
    readonly #node: ServerNode<Credentials>;

    constructor(node: ServerNode<Credentials>, clientEvents: ClientEvents) {
        this.#hostname = node.config.addon
            ? SUPERVISOR_URL
            : node.credentials.host;
        this.#node = node;

        clientEvents.addListeners(this, [
            [ClientEvent.Close, this.onHaEventsClose],
            [ClientEvent.Open, this.onHaEventsOpen],
            [ClientEvent.Connecting, this.onHaEventsConnecting],
            [ClientEvent.Error, this.onHaEventsError],
            [ClientEvent.Running, this.onHaEventsRunning],
            [ClientEvent.StatesLoaded, this.onHaStatesLoaded],
            [ClientEvent.ServicesLoaded, this.onHaServicesLoaded],
            ['integration', this.onIntegrationEvent],
            [ClientEvent.RegistriesLoaded, this.onRegistriesLoaded],
        ]);
        node.on(NodeEvent.Close, this.onClose.bind(this));
    }

    onClose(_removed: boolean, done: NodeDone) {
        this.#node.log(`Closing connection to ${this.#hostname}`);
        done();
    }

    onHaEventsOpen = () => {
        this.#node.log(`Connected to ${this.#hostname}`);
    };

    onHaStatesLoaded = () => {
        this.#node.debug('States Loaded');
    };

    onHaServicesLoaded = () => {
        this.#node.debug('Services Loaded');
    };

    onHaEventsConnecting = () => {
        this.#node.log(`Connecting to ${this.#hostname}`);
    };

    onHaEventsClose = () => {
        this.#node.log(`Connection closed to ${this.#hostname}`);
    };

    onHaEventsRunning = () => {
        this.#node.debug(`HA State: running`);
    };

    onHaEventsError = (err: Error) => {
        this.#node.debug(err);
    };

    onIntegrationEvent = (eventType: IntegrationState) => {
        this.#node.debug(`Integration: ${eventType}`);
    };

    onRegistriesLoaded = () => {
        this.#node.debug('Registries Loaded');
    };
}
