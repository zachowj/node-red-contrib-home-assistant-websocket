import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { TransformType } from '../../common/TransformState';
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

    // TODO: Can be remove during version 1.0.0 release
    if (config.state_type !== TransformType.String) {
        issues.push({
            type: IssueType.DeprecatedConfig,
            message: RED._(
                'home-assistant.service.issue.deprecated_state_type_config',
            ),
            identity: 'state_type',
        });
    }

    return issues;
}

export function isCurrentStateNodeProperties(
    node: NodeProperties,
): node is CurrentStateNodeProperties {
    return node.type === NodeType.CurrentState;
}
