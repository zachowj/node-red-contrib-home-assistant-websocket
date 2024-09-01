import { throttle } from 'lodash';
import { NodeDef } from 'node-red';

import { NodeType } from '../../../const';
import { RED } from '../../../globals';
import { isString } from '../../../helpers/assert';
import { containsMustache, isNodeRedEnvVar } from '../../../helpers/utils';
import { homeAssistantConnections } from '../../../homeAssistant';
import HomeAssistant from '../../../homeAssistant/HomeAssistant';
import { BaseNodeProperties } from '../../../types/nodes';
import { Issue, IssueUpdate } from '.';

/**
 * Get the Home Assistant instance from the node.
 *
 * @param node  The node to get the Home Assistant instance from
 * @returns  The Home Assistant instance
 */
export function getHomeAssistant(
    node: BaseNodeProperties,
): HomeAssistant | undefined {
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
export function getServerId(node: BaseNodeProperties): string | undefined {
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
export function includesIssue(issues: Issue[], issue: Issue): boolean {
    return issues.some((i) => isSameIssue(i, issue));
}

export function isIssuesEqual(a: Issue[], b: Issue[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((issue, index) => isSameIssue(issue, b[index]));
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
 * @returns {boolean | undefined} True if the Home Assistant data is loaded
 */
export function isHomeAssistantDataLoaded(
    node: BaseNodeProperties,
): boolean | undefined {
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
function isSameIssue(a: Issue, b: Issue): boolean {
    return (
        a.type === b.type &&
        a.identity === b.identity &&
        a.message === b.message
    );
}

export const publishIssueUpdate = throttle((issues: IssueUpdate[]): void => {
    RED.log.debug('[Home Assistant] Issues sent to client');
    RED.comms.publish(`homeassistant/issues`, issues, true);
}, 500);

export function isNodeDisabled(node: NodeDef): boolean {
    // @ts-expect-error - d is not defined in NodeDef
    if (node.d === true) {
        return true;
    }

    let disabled = false;
    RED.nodes.eachNode((n) => {
        // @ts-expect-error - disabled is not defined in NodeDef
        if (n.id === node.z && n.disabled === true) {
            disabled = true;
        }
    });

    return disabled;
}
