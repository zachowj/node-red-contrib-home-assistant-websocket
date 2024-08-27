import { Issue, IssueType } from '../../common/services/IssueService';
import { getHomeAssistant } from '../../common/services/IssueService/utils';
import { NodeType, TAGS_ALL } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { TagNodeProperties } from '.';

export default function issueCheck(config: TagNodeProperties): Issue[] {
    const issues: Issue[] = [];

    const ha = getHomeAssistant(config);
    if (!ha) {
        return issues;
    }
    const states = ha.websocket.getStates();
    const tagStates = Object.values(states).filter((state) =>
        state.entity_id.startsWith('tag.'),
    );
    for (const tag of config.tags) {
        if (tag === TAGS_ALL) {
            continue;
        }

        if (!tagStates.find((state) => state.attributes.tag_id === tag)) {
            const message = RED._(
                `home-assistant.service.issue.tag_not_found`,
                {
                    tag_id: tag,
                },
            );
            issues.push({
                type: IssueType.TagId,
                message,
                identity: tag,
            });
        }
    }

    return issues;
}

export function isTagNodeProperties(
    node: NodeProperties,
): node is TagNodeProperties {
    return node.type === NodeType.Tag;
}
