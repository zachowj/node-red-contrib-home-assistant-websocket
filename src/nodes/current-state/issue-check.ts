import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { CurrentStateNodeProperties } from '.';

export default function issueCheck(
    config: CurrentStateNodeProperties,
): Issue[] {
    const issues: Issue[] = [];

    const invalidIds = getInvalidIds(
        IssueType.StateId,
        config,
        config.entity_id,
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

export function isCurrentStateNodeProperties(
    node: NodeProperties,
): node is CurrentStateNodeProperties {
    return node.type === NodeType.CurrentState;
}
