import { NodeDef } from 'node-red';

import { NodeType } from '../../../const';
import { RED } from '../../../globals';
import { isString } from '../../../helpers/assert';
import { containsMustache, isNodeRedEnvVar } from '../../../helpers/utils';
import { homeAssistantConnections } from '../../../homeAssistant';
import { BaseNodeProperties } from '../../../types/nodes';
import { Issue } from '.';

/**
 * Get the Home Assistant instance from the node.
 *
 * @param node  The node to get the Home Assistant instance from
 * @returns  The Home Assistant instance
 */
export function getHomeAssistant(node: BaseNodeProperties) {
    if (node.type === NodeType.Server) {
        return homeAssistantConnections.get(node.id);
    }
    if ('server' in node && isString(node.server)) {
        const server = RED.nodes.getNode(node.server);
        if (!server) {
            return;
        }
        return homeAssistantConnections.get(server.id);
    }
}

/**
 * Get the server ID from the node.
 *
 * @param node  The node to get the server ID from
 * @returns  The server ID
 */
export function getServerId(node: BaseNodeProperties) {
    if (node.type === NodeType.Server) {
        return node.id;
    }

    return node.server;
}

/**
 * Check if the issue is included in the array of issues.
 *
 * @param issues  The array of issues to check
 * @param issue  The issue to check for
 * @returns {boolean}  True if the issue is included in the array of issues
 */
export function includesIssue(issues: Issue[], issue: Issue) {
    return issues.some((i) => isSameIssue(i, issue));
}

/**
 * Check if the value is a mustache template or a Node-RED environment variable.
 *
 * @param value
 * @returns {boolean}
 */
export function isDynamicValue(value: string): boolean {
    return containsMustache(value) || isNodeRedEnvVar(value);
}

/**
 * Check if all the registries, states and services data are loaded.
 *
 * @param node  The node to check
 * @returns {boolean} True if the Home Assistant data is loaded
 */
export function isHomeAssistantDataLoaded(node: BaseNodeProperties) {
    const ha = getHomeAssistant(node);
    return ha?.websocket.isAllRegistriesLoaded;
}

/**
 * Check if the node is a Home Assistant node.
 *
 * @param node  The node to check
 * @returns {boolean} True if the node is a Home Assistant node
 */
export function isHomeAssistantNode(node: NodeDef): node is BaseNodeProperties {
    return Object.values(NodeType).includes(node.type as NodeType);
}

/**
 * Check if the issues are the same.
 *
 * @param a  The first issue to compare
 * @param b  The second issue to compare
 * @returns  True if the issues are the same
 */
function isSameIssue(a: Issue, b: Issue) {
    return (
        a.type === b.type &&
        a.identity === b.identity &&
        a.message === b.message
    );
}
