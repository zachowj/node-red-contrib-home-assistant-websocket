import { BaseNodeProperties } from '../../../types/nodes';
import { IssueType } from '.';
import { getHomeAssistant, isDynamicValue } from './helpers';

export function getInvalidIds(
    type: IssueType,
    config: BaseNodeProperties,
    ids: string | string[] | undefined,
): string[] {
    const invalidIds: string[] = [];

    if (!ids) {
        return invalidIds;
    }

    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    const ha = getHomeAssistant(config);
    if (!ha?.websocket.isStatesLoaded) {
        return invalidIds;
    }

    for (const id of ids) {
        if (isDynamicValue(id)) {
            continue;
        }

        switch (type) {
            case IssueType.AreaId:
                if (!ha.websocket.getArea(id)) {
                    invalidIds.push(id);
                }
                break;
            case IssueType.DeviceId:
                if (!ha.websocket.getDevice(id)) {
                    invalidIds.push(id);
                }
                break;
            case IssueType.EntityId:
                if (!ha.websocket.getEntity(id)) {
                    invalidIds.push(id);
                }
                break;
            case IssueType.FloorId:
                if (!ha.websocket.getFloor(id)) {
                    invalidIds.push(id);
                }
                break;
            case IssueType.LabelId:
                if (!ha.websocket.getLabel(id)) {
                    invalidIds.push(id);
                }
                break;
            case IssueType.StateId:
                if (!ha.websocket.getStates(id)) {
                    invalidIds.push(id);
                }
                break;
        }
    }

    return invalidIds;
}
