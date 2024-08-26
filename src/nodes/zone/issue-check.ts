import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { ZoneNodeProperties } from '.';

export default function issueCheck(config: ZoneNodeProperties): Issue[] {
    const issues: Issue[] = [];

    const invalidEntityIds = getInvalidIds(
        IssueType.StateId,
        config,
        config.entities,
    );
    for (const id of invalidEntityIds) {
        const message = RED._(`home-assistant.service.issue.entity_not_found`, {
            entity_id: id,
        });
        issues.push({
            type: IssueType.StateId,
            message,
            identity: id,
        });
    }

    const invalidZoneIds = getInvalidIds(
        IssueType.StateId,
        config,
        config.zones,
    );
    for (const id of invalidZoneIds) {
        const message = RED._(`home-assistant.service.issue.zone_not_found`, {
            zone_id: id,
        });
        issues.push({
            type: IssueType.StateId,
            message,
            identity: id,
        });
    }

    return issues;
}

export function isZoneNodeProperties(
    node: NodeProperties,
): node is ZoneNodeProperties {
    return node.type === NodeType.Zone;
}
