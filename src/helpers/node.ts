import { NodeStatus } from 'node-red';

import { RED } from '../globals';
import { Credentials, hasCredentials } from '../homeAssistant';
import { EntityConfigNode } from '../nodes/entity-config/index';
import { BaseNode, EntityNode, ServerNode } from '../types/nodes';

export const getNode = <T extends BaseNode>(nodeId?: string): T | undefined => {
    if (!nodeId) return;
    return RED.nodes.getNode(nodeId) as T;
};

export const getServerConfigNode = (
    nodeId?: string
): ServerNode<Credentials> => {
    if (!nodeId) {
        throw new Error('Invalid server config');
    }

    const node = RED.nodes.getNode(nodeId) as ServerNode<Credentials>;

    if (!node) {
        throw new Error('Invalid server config');
    }

    checkValidServerConfig(node);

    return node;
};

const checkValidServerConfig = (serverConfigNode: ServerNode<Credentials>) => {
    if (serverConfigNode.config.addon) {
        return;
    }

    if (!hasCredentials(serverConfigNode.credentials)) {
        throw new Error('Invalid server config');
    }
};

export const getConfigNodes = (node: EntityNode) => {
    const status: NodeStatus = {
        shape: 'dot',
        fill: 'red',
        text: RED._('home-assistant.status.error'),
    };

    const entityConfigNode = getNode<EntityConfigNode>(
        node.config.entityConfig
    ) as EntityConfigNode;

    if (!entityConfigNode) {
        node.status(status);
        throw new Error('Invalid entity config');
    }

    const serverConfigNode = getServerConfigNode(
        entityConfigNode.config.server
    );

    if (!serverConfigNode) {
        node.status(status);
        throw new Error('Invalid server config');
    }

    checkValidServerConfig(serverConfigNode);

    return {
        entityConfigNode,
        serverConfigNode,
    };
};
