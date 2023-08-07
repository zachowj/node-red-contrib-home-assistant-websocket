import { isMatch } from 'lodash';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController, {
    OutputControllerConstructor,
} from '../../common/controllers/OutputController';
import ConfigError from '../../common/errors/ConfigError';
import { ClientEvent } from '../../homeAssistant/Websocket';
import { HassEvent } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { EntityConfigNode } from '../entity-config';
import { EventsAllNode, HA_CLIENT } from '.';

interface EventsAllNodeConstructor
    extends OutputControllerConstructor<EventsAllNode> {
    exposeAsConfigNode?: EntityConfigNode;
}

const ExposeAsController = ExposeAsMixin(OutputController<EventsAllNode>);
export default class EventsAll extends ExposeAsController {
    #eventData: Record<string, any> | undefined;

    constructor(props: EventsAllNodeConstructor) {
        super(props);

        try {
            if (this.node.config.eventData) {
                this.#eventData = JSON.parse(this.node.config.eventData);
            }
        } catch (e) {
            throw new ConfigError('server-events.error.invalid_json');
        }
    }

    #clientEvent(type: string, data?: any) {
        if (this.isEnabled === false) return;

        if (
            this.node.config.eventType === '' ||
            this.node.config.eventType === HA_CLIENT
        ) {
            this.node.send({
                event_type: HA_CLIENT,
                topic: `${HA_CLIENT}:${type}`,
                payload: type,
                data,
            } as NodeMessage);

            if (
                type === ClientEvent.StatesLoaded ||
                type === ClientEvent.ServicesLoaded
            ) {
                this.status.setSuccess(type);
            }
        }
    }

    public onHaEventsAll(evt: HassEvent) {
        if (this.isEnabled === false) return;

        if (
            !this.homeAssistant.isHomeAssistantRunning &&
            this.node.config.waitForRunning === true
        ) {
            return;
        }

        // Compare event data
        if (this.#eventData && !isMatch(evt.event, this.#eventData)) return;

        const message: NodeMessage = {};
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            eventData: evt,
        });

        this.status.setSuccess(evt.event_type);
        this.node.send(message);
    }

    public onHaEventsClose() {
        this.#clientEvent('disconnected');
    }

    public onHaEventsOpen() {
        this.#clientEvent('connected');
    }

    public onHaEventsConnecting() {
        this.#clientEvent('connecting');
    }

    public onHaEventsRunning() {
        this.#clientEvent('running');
    }

    public onHaEventsReady() {
        this.#clientEvent('ready');
    }

    public onHaEventsError(err: Error) {
        if (err) {
            this.#clientEvent('error', err.message);
        }
    }

    public onClientStatesLoaded() {
        this.#clientEvent('states_loaded');
    }

    public onClientServicesLoaded() {
        this.#clientEvent('services_loaded');
    }
}
