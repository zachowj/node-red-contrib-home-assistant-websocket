import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { TimeNodeProperties } from '.';

export default function issueCheck(config: TimeNodeProperties): Issue[] {
    const issues: Issue[] = [];

    const invalidIds = getInvalidIds(
        IssueType.StateId,
        config,
        config.entityId,
    );
    for (const id of invalidIds) {
        const message = RED._(`home-assistant.service.issue.entity_not_found`, {
            entity_id: id,
        });
        issues.push({
            type: IssueType.StateId,
            message,
            identity: id,
        });
    }

    return issues;
}

export function isTimeNodeProperties(
    node: NodeProperties,
): node is TimeNodeProperties {
    return node.type === NodeType.Time;
}
