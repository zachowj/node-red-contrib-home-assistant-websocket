import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { EventsCalendarNodeProperties } from '.';

export default function issueCheck(
    config: EventsCalendarNodeProperties,
): Issue[] {
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

export function isEventsCalendarNodeProperties(
    node: NodeProperties,
): node is EventsCalendarNodeProperties {
    return node.type === NodeType.EventsCalendar;
}
