import { NodeDef } from 'node-red';

import { RED } from '../../../globals';
import { HaEvent } from '../../../homeAssistant';
import HomeAssistant from '../../../homeAssistant/HomeAssistant';
import { ClientEvent } from '../../../homeAssistant/Websocket';
import actionIssueCheck, {
    isActionNodeProperties,
} from '../../../nodes/action/issue-check';
import currentStateIssueCheck, {
    isCurrentStateNodeProperties,
} from '../../../nodes/current-state/issue-check';
import deviceIssueCheck, {
    isDeviceNodeProperties,
} from '../../../nodes/device/issue-check';
import eventsCalendarIssueCheck, {
    isEventsCalendarNodeProperties,
} from '../../../nodes/events-calendar/issue-check';
import eventsStateIssueCheck, {
    isEventsStateNodeProperties,
} from '../../../nodes/events-state/issue-check';
import getHistoryIssueCheck, {
    isGetHistoryNodeProperties,
} from '../../../nodes/get-history/issue-check';
import pollStateIssueCheck, {
    isPollStateNodeProperties,
} from '../../../nodes/poll-state/issue-check';
import tagIssueCheck, {
    isTagNodeProperties,
} from '../../../nodes/tag/issue-check';
import timeIssueCheck, {
    isTimeNodeProperties,
} from '../../../nodes/time/issue-check';
import triggerStateIssueCheck, {
    isTriggerStateProperties,
} from '../../../nodes/trigger-state/issue-check';
import waitUntilIssueCheck, {
    isWaitUntilNodeProperties,
} from '../../../nodes/wait-until/issue-check';
import zoneIssueCheck, {
    isZoneNodeProperties,
} from '../../../nodes/zone/issue-check';
import { HassStateChangedEvent } from '../../../types/home-assistant';
import { BaseNodeProperties, NodeProperties } from '../../../types/nodes';
import storageService from '../../services/StorageService';
import {
    getHomeAssistant,
    getServerId,
    includesIssue,
    isHomeAssistantDataLoaded,
    isHomeAssistantNode,
    isIssuesEqual,
    isNodeDisabled,
} from './utils';

enum NodeRedEvent {
    FlowsStarted = 'flows:started',
}

enum DeploymentType {
    Full = 'full',
    Nodes = 'nodes',
}

export enum IssueType {
    AreaId = 'areaId',
    DeprecatedConfig = 'deprecatedConfig',
    DeviceId = 'deviceId',
    EntityId = 'entityId',
    FloorId = 'floorId',
    InvalidAction = 'invalidAction',
    LabelId = 'labelId',
    StateId = 'stateId',
    TagId = 'tagId',
}

const IssueTypeToRegistryEventMap = {
    [IssueType.AreaId]: HaEvent.AreaRegistryUpdated,
    [IssueType.DeviceId]: HaEvent.DeviceRegistryUpdated,
    [IssueType.FloorId]: HaEvent.FloorRegistryUpdated,
    [IssueType.LabelId]: HaEvent.LabelRegistryUpdated,
} as const;

type IssueListener = (event?: HassStateChangedEvent) => void;

export interface Issue {
    type: IssueType;
    message: string;
    identity: string;
    hide?: boolean;
    unsubscribe?: IssueListener;
}

export interface IssueUpdate {
    nodeId: string;
    messages: string[];
    hide: boolean;
}

type UpdateHandler = (issues: IssueUpdate[]) => void;

interface FlowsStartedEvent {
    config: {
        flows: NodeDef[];
        rev: string;
    };
    type: DeploymentType;
    diff?: {
        added: string[];
        changed: string[];
        removed: string[];
        rewired: string[];
        linked: string[];
        flowChanged: string[];
        globalConfigChanged: boolean;
    };
}

const SIX_HOURS = 6 * 60 * 60 * 1000;

class IssueService {
    #initialized = false;
    #nodesToCheck = new Map<string, BaseNodeProperties[]>();
    #issues = new Map<string, Issue[]>();
    #hiddenIssues: Set<string> = new Set();
    #updateHandlers: UpdateHandler[] = [];
    #tabs: Record<string, boolean | undefined> = {};

    public init(updateHandler?: UpdateHandler | UpdateHandler[]) {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;
        if (updateHandler) {
            if (Array.isArray(updateHandler)) {
                this.#updateHandlers.push(...updateHandler);
            } else {
                this.#updateHandlers.push(updateHandler);
            }
        }

        this.#loadHiddenIssues();

        RED.events.on(NodeRedEvent.FlowsStarted, (event: FlowsStartedEvent) => {
            this.#getTabInfo();
            this.#handleFlowsStarted(event);
        });

        // every hour, check all nodes for issues
        setInterval(this.#handlePeriodicCheck.bind(this), SIX_HOURS);
    }

    #getChangedNodes(eventData: FlowsStartedEvent): NodeDef[] {
        if (eventData.type === DeploymentType.Full) {
            this.#issues.clear();
            return eventData.config.flows;
        }

        const changedNodes = new Set<string>();
        if (eventData.diff) {
            for (const id of eventData.diff.changed) {
                // a node can be changed and removed in the same deploy
                if (eventData.diff.removed.includes(id)) {
                    continue;
                }
                changedNodes.add(id);
            }
            for (const id of eventData.diff.added) {
                changedNodes.add(id);
            }
            for (const id of eventData.diff.removed) {
                this.#removeIssue(id);
            }
        }

        const changedNodesArray = Array.from(changedNodes);
        const changedNodesArrayWithDefs = changedNodesArray.reduce(
            (acc: NodeDef[], id: string) => {
                const node = eventData.config.flows.find(
                    (flow) => flow.id === id,
                );
                if (node) {
                    acc.push(node);
                }
                return acc;
            },
            [],
        );

        return changedNodesArrayWithDefs;
    }

    // There's no way to get tab info from a node def without looping over all nodes
    // so we need to listen for flows started and save tabs info in a map
    #getTabInfo() {
        RED.nodes.eachNode((node) => {
            if (node.type === 'tab') {
                // @ts-expect-error - disabled is not defined in NodeDef
                this.#tabs[node.id] = node.disabled;
            }
        });
    }

    #handleFlowsStarted(event: FlowsStartedEvent) {
        const changedNodes = this.#getChangedNodes(event).filter(
            (node) => !isNodeDisabled(node, this.#tabs[node.z]),
        );
        this.#performChecks(changedNodes);
    }

    #handlePeriodicCheck() {
        const nodes: NodeDef[] = [];
        const foundHiddenIssueNodes = new Set<string>();

        RED.nodes?.eachNode((node) => {
            // build a list that still exists
            if (this.#hiddenIssues.has(node.id)) {
                foundHiddenIssueNodes.add(node.id);
            }

            // only check nodes that are not disabled
            if (!isNodeDisabled(node, this.#tabs[node.z])) {
                nodes.push(node);
            }
        });

        // remove hidden issues that no longer exist
        this.#hiddenIssues = foundHiddenIssueNodes;
        this.#saveHiddenIssues();
        this.#performChecks(nodes);
    }

    // Loop through nodes, check if HA data is not loaded, wait for it to load then run checks
    #performChecks(nodes: NodeDef[]) {
        for (const node of nodes) {
            if (!isHomeAssistantNode(node)) {
                continue;
            }
            if (isHomeAssistantDataLoaded(node)) {
                this.#checkForIssues(node);
                continue;
            }

            const serverId = getServerId(node);
            if (!serverId) {
                continue;
            }
            if (this.#nodesToCheck.has(serverId)) {
                this.#nodesToCheck.get(serverId)?.push(node);
            } else {
                this.#nodesToCheck.set(serverId, [node]);
            }
            const ha = getHomeAssistant(node);
            // if HA is not connected, wait for it to connect and load data
            ha?.eventBus.once(ClientEvent.RegistriesLoaded, () => {
                const nodes = this.#nodesToCheck.get(serverId);
                if (nodes) {
                    for (const node of nodes) {
                        this.#checkForIssues(node);
                    }
                }
                this.#nodesToCheck.delete(serverId);
            });
        }
    }

    // Define a mapping of node type check functions to issue check functions
    #issueCheckMap: [
        (node: NodeProperties) => boolean,
        (node: any) => Issue[],
    ][] = [
        [isActionNodeProperties, actionIssueCheck],
        [isCurrentStateNodeProperties, currentStateIssueCheck],
        [isDeviceNodeProperties, deviceIssueCheck],
        [isEventsCalendarNodeProperties, eventsCalendarIssueCheck],
        [isEventsStateNodeProperties, eventsStateIssueCheck],
        [isGetHistoryNodeProperties, getHistoryIssueCheck],
        [isPollStateNodeProperties, pollStateIssueCheck],
        [isTagNodeProperties, tagIssueCheck],
        [isTimeNodeProperties, timeIssueCheck],
        [isTriggerStateProperties, triggerStateIssueCheck],
        [isWaitUntilNodeProperties, waitUntilIssueCheck],
        [isZoneNodeProperties, zoneIssueCheck],
    ] as const;

    // Check for issues on a node
    #checkForIssues(node: BaseNodeProperties): Issue[] {
        let issues: Issue[] = [];

        for (const [checkFn, issueFn] of this.#issueCheckMap) {
            if (checkFn(node)) {
                issues = issueFn(node);
                break;
            }
        }

        if (issues.length) {
            this.#listenForIssueEvents(node, issues);
            this.#setIssue(node.id, issues);
        } else {
            this.#removeIssue(node.id);
        }

        return issues;
    }

    // Listen for events to check if the issue is fixed on the Home Assistant side
    #listenForIssueEvents(node: BaseNodeProperties, issues: Issue[]) {
        const ha = getHomeAssistant(node);
        if (!ha) {
            return;
        }

        for (const issue of issues) {
            switch (issue.type) {
                case IssueType.StateId: {
                    // listen for state changes to check if the issue is fixed
                    const eventName = `ha_events:state_changed:${issue.identity}`;
                    const onEvent = (event?: HassStateChangedEvent) => {
                        if (event?.entity_id === issue.identity) {
                            const foundIssues = this.#checkForIssues(node);
                            // if the issue is still present, keep listening
                            if (!includesIssue(foundIssues, issue)) {
                                issue.unsubscribe?.();
                            }
                        }
                    };
                    this.#addListener(ha, issue, eventName, onEvent);
                    break;
                }
                case IssueType.AreaId:
                case IssueType.DeviceId:
                case IssueType.EntityId:
                case IssueType.FloorId:
                case IssueType.LabelId:
                    this.#listenForRegistryEvent(ha, issue, node);
                    break;
            }
        }
    }

    // Listen for registry events to check if the issue is fixed on the Home Assistant side
    #listenForRegistryEvent(
        ha: HomeAssistant,
        issue: Issue,
        node: BaseNodeProperties,
    ) {
        const event =
            IssueTypeToRegistryEventMap[
                issue.type as keyof typeof IssueTypeToRegistryEventMap
            ];
        // listen for registry changes to check if the issue is fixed
        const onEvent = () => {
            const foundIssues = this.#checkForIssues(node);
            // if the issue is still present, keep listening
            if (!includesIssue(foundIssues, issue)) {
                issue.unsubscribe?.();
            }
        };
        this.#addListener(ha, issue, event, onEvent);
    }

    #setIssue(nodeId: string, issues: Issue[]) {
        if (isIssuesEqual(issues, this.#issues.get(nodeId) || [])) {
            return;
        }

        this.#issues.set(nodeId, issues);

        RED.log.debug(`[Home Assistant] Issue added: ${nodeId}`);
        this.#issuesUpdated();
    }

    #removeIssue(nodeId: string) {
        if (!this.#issues.has(nodeId)) {
            return;
        }

        // remove listeners
        const issues = this.#issues.get(nodeId);
        issues?.forEach((issue) => {
            issue.unsubscribe?.();
        });

        this.#issues.delete(nodeId);
        this.#hiddenIssues.delete(nodeId);
        RED.log.debug(`[Home Assistant] Issue removed: ${nodeId}`);
        this.#issuesUpdated();
    }

    #issuesUpdated(): void {
        const issues = Array.from(this.#issues).map(([nodeId, issues]) => ({
            nodeId,
            messages: issues.map((issue) => issue.message),
            hide: this.#hiddenIssues.has(nodeId),
        }));

        this.#updateHandlers.forEach((handler) => handler(issues));
    }

    public toggleIssueHiddenStatus(nodeId: string) {
        if (this.#hiddenIssues.has(nodeId)) {
            this.#hiddenIssues.delete(nodeId);
        } else {
            this.#hiddenIssues.add(nodeId);
        }

        this.#saveHiddenIssues();
        this.#issuesUpdated();
    }

    #loadHiddenIssues() {
        this.#hiddenIssues = new Set(storageService.getIssues());
    }

    #saveHiddenIssues() {
        storageService.saveIssues(Array.from(this.#hiddenIssues));
    }

    #addListener(
        ha: HomeAssistant,
        issue: Issue,
        event: string,
        handler: IssueListener,
    ) {
        ha.eventBus.on(event, handler);

        issue.unsubscribe = () => {
            ha.eventBus.removeListener(event, handler);
            issue.unsubscribe = undefined;
        };
    }

    public addUpdateHandler(handler: UpdateHandler) {
        this.#updateHandlers.push(handler);
    }

    public removeUpdateHandler(handler: UpdateHandler) {
        const index = this.#updateHandlers.indexOf(handler);
        if (index !== -1) {
            this.#updateHandlers.splice(index, 1);
        }
    }
}

export default new IssueService();
