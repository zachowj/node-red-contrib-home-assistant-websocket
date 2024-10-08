import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { EventsStateNodeProperties } from '.';

export default function issueCheck(config: EventsStateNodeProperties): Issue[] {
    const issues: Issue[] = [];

    const invalidIds = getInvalidIds(
        IssueType.StateId,
        config,
        config.entities?.entity,
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

export function isEventsStateNodeProperties(
    node: NodeProperties,
): node is EventsStateNodeProperties {
    return node.type === NodeType.EventsState;
}
