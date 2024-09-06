import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import {
    getHomeAssistant,
    isDynamicValue,
} from '../../common/services/IssueService/utils';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { ActionNodeProperties } from '.';

interface Target {
    idsProperty: 'entityId' | 'areaId' | 'deviceId' | 'floorId' | 'labelId';
    type: IssueType;
    issueMessage: string;
    issueProperty: string;
}

// TODO: Fix - Why is IssueType throwing an access undefined error?
const targets: Target[] = [
    {
        idsProperty: 'entityId',
        // type: IssueType.EntityId,
        type: 'stateId' as IssueType,
        issueMessage: 'target_entity_not_found',
        issueProperty: 'entity_id',
    },
    {
        idsProperty: 'deviceId',
        // type: IssueType.DeviceId,
        type: 'deviceId' as IssueType,
        issueMessage: 'target_device_not_found',
        issueProperty: 'device_id',
    },
    {
        idsProperty: 'areaId',
        // type: IssueType.AreaId,
        type: 'areaId' as IssueType,
        issueMessage: 'target_area_not_found',
        issueProperty: 'area_id',
    },
    {
        idsProperty: 'floorId',
        // type: IssueType.FloorId,
        type: 'floorId' as IssueType,
        issueMessage: 'target_floor_not_found',
        issueProperty: 'floor_id',
    },
    {
        idsProperty: 'labelId',
        // type: IssueType.LabelId,
        type: 'labelId' as IssueType,
        issueMessage: 'target_label_not_found',
        issueProperty: 'label_id',
    },
];

export default function issueCheck(config: ActionNodeProperties): Issue[] {
    const issues: Issue[] = [];

    // Check if the action is valid
    if (config.action && !isDynamicValue(config.action)) {
        const ha = getHomeAssistant(config);
        const services = ha?.websocket.getServices();
        const [domain, service] = config.action
            .toLocaleLowerCase()
            .split('.')
            .map((part) => part.trim());
        if (!services?.[domain]?.[service]) {
            const message = RED._(
                'home-assistant.service.issue.invalid_action',
                {
                    action: config.action,
                },
            );
            issues.push({
                type: IssueType.InvalidAction,
                message,
                identity: config.action,
            });
        } else {
            // TODO: Remove in version 1.0 - Should no longer be needed
            // check if target.entity_id should be in data.entity_id
            if (services[domain]?.[service]?.fields?.entity_id !== undefined) {
                let data: Record<string, unknown> = {};
                try {
                    data = JSON.parse(config.data || '{}');
                } catch (e) {
                    // fail silently
                }
                if (config.entityId?.length && !data.entity_id) {
                    const ids = config.entityId.join(', ');
                    issues.push({
                        type: IssueType.EntityId,
                        message: RED._(
                            'home-assistant.service.issue.entity_id_target_data',
                            {
                                entity_id: ids,
                            },
                        ),
                        identity: ids,
                    });
                }
            }
        }
    }

    // Check if the targets are valid
    for (const target of targets) {
        const invalidIds = getInvalidIds(
            target.type,
            config,
            config[target.idsProperty],
        );
        for (const id of invalidIds) {
            // Skip the 'all' entity id if the target is entityId
            // https://www.home-assistant.io/docs/scripts/perform-actions/#the-basics
            if (id === 'all' && target.idsProperty === 'entityId') {
                continue;
            }
            const message = RED._(
                `home-assistant.service.issue.${target.issueMessage}`,
                {
                    [target.issueProperty]: id,
                },
            );
            issues.push({
                type: target.type,
                message,
                identity: id,
            });
        }
    }

    return issues;
}

export function isActionNodeProperties(
    node: NodeProperties,
): node is ActionNodeProperties {
    return node.type === NodeType.Action;
}
