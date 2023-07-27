import { NodeStatus } from 'node-red';

import { StatusColor, StatusShape } from '../common/status/Status';
import { NodeType, PRINT_TO_DEBUG_TOPIC } from '../const';
import { RED } from '../globals';
import { Credentials, hasCredentials } from '../homeAssistant';
import { EntityConfigNode } from '../nodes/entity-config/index';
import { BaseNode, EntityNode, ServerNode } from '../types/nodes';

export function getNode<T extends BaseNode>(nodeId?: string): T | undefined {
    if (!nodeId) return;
    return RED.nodes.getNode(nodeId) as T;
}

export function getServerConfigNode(nodeId?: string): ServerNode<Credentials> {
    if (!nodeId) {
        throw new Error('Invalid server config');
    }

    const node = RED.nodes.getNode(nodeId) as ServerNode<Credentials>;

    if (!node) {
        throw new Error('Invalid server config');
    }

    checkValidServerConfig(node);

    return node;
}

function checkValidServerConfig(serverConfigNode: ServerNode<Credentials>) {
    if (serverConfigNode.config.addon) {
        return;
    }

    if (!hasCredentials(serverConfigNode.credentials)) {
        throw new Error('Invalid server config');
    }
}

export function getConfigNodes(node: EntityNode) {
    const status: NodeStatus = {
        shape: StatusShape.Dot,
        fill: StatusColor.Red,
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
}

export function getExposeAsConfigNode(
    nodeId?: string
): EntityConfigNode | undefined {
    return getNode<EntityConfigNode>(nodeId) as EntityConfigNode;
}

function isConfigNode(node: BaseNode | EntityNode): boolean {
    return (
        node.type === NodeType.DeviceConfig ||
        node.type === NodeType.EntityConfig ||
        node.type === NodeType.Server
    );
}

export function debugToClient(
    node: BaseNode | EntityNode,
    message: any,
    topic?: string
) {
    if (!node.config.debugenabled && !node.config.debugEnabled) return;

    const debug = {
        id: node.id,
        msg: message,
        name: node.name,
        path: isConfigNode(node) ? node.id : `${node.z}/${node.id}`,
        topic,
    };
    RED.comms.publish(PRINT_TO_DEBUG_TOPIC, debug, false);
}
