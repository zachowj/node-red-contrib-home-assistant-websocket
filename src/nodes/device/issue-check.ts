import { Issue, IssueType } from '../../common/services/IssueService';
import { getInvalidIds } from '../../common/services/IssueService/check';
import { NodeType } from '../../const';
import { RED } from '../../globals';
import { NodeProperties } from '../../types/nodes';
import { DeviceNodeProperties } from '.';

export default function issueCheck(config: DeviceNodeProperties): Issue[] {
    const issues: Issue[] = [];

    const invalidIds = getInvalidIds(IssueType.DeviceId, config, config.device);
    for (const id of invalidIds) {
        const message = RED._(`home-assistant.service.issue.device_not_found`, {
            device_id: id,
        });
        issues.push({
            type: IssueType.DeviceId,
            message,
            identity: id,
        });
    }

    return issues;
}

export function isDeviceNodeProperties(
    node: NodeProperties,
): node is DeviceNodeProperties {
    return node.type === NodeType.Device;
}
