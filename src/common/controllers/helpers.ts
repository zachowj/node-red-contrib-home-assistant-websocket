import { Credentials } from '../../homeAssistant';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { EntityConfigNode } from '../../nodes/entity-config';
import { BaseNode, ServerNode } from '../../types/nodes';
import ClientEvents from '../events/ClientEvents';
import JSONataService from '../services/JSONataService';
import NodeRedContextService from '../services/NodeRedContextService';
import TypedInputService from '../services/TypedInputService';
import EventsStatus from '../status/EventStatus';

/**
 * Create some of the dependencies needed for a BaseNode controller.
 * @param node The node to create the controller for.
 * @param homeAssistant The home assistant instance to use.
 * @returns The dependencies needed for a BaseNode controller.
 */
export function createControllerDependencies(
    node: BaseNode,
    homeAssistant: HomeAssistant,
) {
    const jsonataService = new JSONataService({
        homeAssistant,
        node,
    });
    const nodeRedContextService = new NodeRedContextService(node);
    const typedInputService = new TypedInputService({
        nodeConfig: node.config,
        context: nodeRedContextService,
        jsonata: jsonataService,
    });

    return {
        homeAssistant,
        jsonataService,
        nodeRedContextService,
        typedInputService,
    };
}

export function createExposeAsControllerDependences({
    exposeAsConfigNode,
    homeAssistant,
    node,
    serverConfigNode,
}: {
    exposeAsConfigNode?: EntityConfigNode;
    homeAssistant: HomeAssistant;
    node: BaseNode;
    serverConfigNode: ServerNode<Credentials>;
}) {
    const controllerDeps = createControllerDependencies(node, homeAssistant);

    const clientEvents = new ClientEvents({
        node,
        emitter: homeAssistant.eventBus,
    });

    const status = new EventsStatus({
        clientEvents,
        config: serverConfigNode.config,
        exposeAsEntityConfigNode: exposeAsConfigNode,
        node,
    });

    return {
        ...controllerDeps,
        exposeAsConfigNode,
        status,
    };
}
