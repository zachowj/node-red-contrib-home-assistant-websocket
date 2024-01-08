import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { BaseNode } from '../../types/nodes';
import JSONataService from '../services/JSONataService';
import NodeRedContextService from '../services/NodeRedContextService';
import TypedInputService from '../services/TypedInputService';

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
