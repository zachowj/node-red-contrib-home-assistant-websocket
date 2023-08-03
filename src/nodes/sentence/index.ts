import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import { IntegrationEvent } from '../../common/integration/Integration';
import State from '../../common/State';
import Status from '../../common/status/Status';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant/index';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import SentenceController from './SentenceController';
import SentenceIntegration from './SentenceIntegration';

export interface SentenceNodeProperties extends BaseNodeProperties {
    sentences: string[];
    outputProperties: OutputProperty[];
}

export interface SentenceNode extends BaseNode {
    config: SentenceNodeProperties;
}

export default function sentenceNode(
    this: SentenceNode,
    config: SentenceNodeProperties
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);

    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });
    const nodeEvents = new Events({ node: this, emitter: this });
    const state = new State(this);
    const status = new Status({
        config: serverConfigNode.config,
        node: this,
    });
    nodeEvents.setStatus(status);
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const integration = new SentenceIntegration({
        node: this,
        clientEvents,
        homeAssistant,
        state,
    });
    integration.setStatus(status);

    const controller = new SentenceController({
        node: this,
        status,
        ...controllerDeps,
    });

    nodeEvents.addListener(
        IntegrationEvent.Trigger,
        controller.onReceivedMessage.bind(controller)
    );

    integration.init();
}
