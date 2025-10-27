import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { TransformType } from '../../common/TransformState';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { TriggerStateProperties } from '.';

export default function issueCheck(config: TriggerStateProperties): Issue[] {
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

    // TODO: Can be remove during version 1.0.0 release
    // @ts-expect-error: deprecated property
    if (config.state_type && config.state_type !== TransformType.String) {
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

export function isTriggerStateProperties(
    node: NodeProperties,
): node is TriggerStateProperties {
    return node.type === NodeType.TriggerState;
}
