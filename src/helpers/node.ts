import { NodeStatus } from 'node-red';

import { RED } from '../globals';
import { Credentials } from '../homeAssistant';
import { EntityConfigNode } from '../nodes/entity-config/index';
import { BaseNode, EntityNode, ServerNode } from '../types/nodes';

export const getNode = <T extends BaseNode>(nodeId?: string): T | undefined => {
    if (!nodeId) return;
    return RED.nodes.getNode(nodeId) as T;
};

export const getServerConfigNode = (
    node: BaseNode
): ServerNode<Credentials> => {
    return getNode(node.config.server) as ServerNode<Credentials>;
};

const status: NodeStatus = {
    shape: 'dot',
    fill: 'red',
    text: 'Error',
};

export const getConfigNodes = (node: EntityNode) => {
    const entityConfigNode = getNode<EntityConfigNode>(
        node.config.entityConfig
    ) as EntityConfigNode;

    if (!entityConfigNode) {
        node.status(status);
        throw new Error('Entity config node not found');
    }

    const serverConfigNode = getNode<ServerNode<Credentials>>(
        entityConfigNode.config.server
    );

    if (!serverConfigNode) {
        node.status(status);
        throw new Error('Server config node not found');
    }

    return {
        entityConfigNode,
        serverConfigNode,
    };
};
