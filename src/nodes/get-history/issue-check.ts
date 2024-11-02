import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { GetHistoryNodeProperties } from '.';

export default function issueCheck(config: GetHistoryNodeProperties): Issue[] {
    const issues: Issue[] = [];

    // Check if entityIdType is equals and entityId is set
    if (config.entityIdType !== 'equals' || !config.entityId) {
        return issues;
    }

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

export function isGetHistoryNodeProperties(
    node: NodeProperties,
): node is GetHistoryNodeProperties {
    return node.type === NodeType.GetHistory;
}
