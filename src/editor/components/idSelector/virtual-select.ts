import { IdSelectorType } from '../../../common/const';
import { SelectorType } from '../../../nodes/config-server/editor';
import { VirtualSelectOption } from '../../../types/virtual-select';
import { getUiSettings } from '../../haserver';
import * as haServer from '../../haserver';

export function createSelectOptions(
    type: IdSelectorType,
): VirtualSelectOption[] {
    const list: VirtualSelectOption[] = [];
    const useDeviceId = getUiSettings().deviceSelector === SelectorType.Id;
    const useEntityId = getUiSettings().entitySelector === SelectorType.Id;

    switch (type) {
        case IdSelectorType.Floor:
            haServer.getFloors().forEach((floor) => {
                list.push({
                    label: floor.name,
                    value: floor.floor_id,
                    alias: [floor.floor_id],
                });
            });
            break;
        case IdSelectorType.Area:
            haServer.getAreas().forEach((area) => {
                list.push({
                    label: area.name,
                    value: area.area_id,
                    alias: [area.area_id],
                });
            });
            break;
        case IdSelectorType.Device:
            haServer.getDevices().forEach((device) => {
                const label = useDeviceId
                    ? device.id
                    : device.name_by_user || device.name;
                list.push({
                    label,
                    value: device.id,
                    description: haServer.getAreaNameById(device.area_id),
                    alias: [device.id],
                });
            });
            break;
        case IdSelectorType.Entity: {
            const entities = haServer.getEntities();
            entities.forEach((entity) => {
                const label = useEntityId
                    ? entity.entity_id
                    : entity.attributes.friendly_name || entity.entity_id;
                const description = useEntityId
                    ? entity.attributes.friendly_name
                    : entity.entity_id;
                list.push({
                    label,
                    value: entity.entity_id,
                    description,
                });
            });
            break;
        }
        case IdSelectorType.Label:
            haServer.getLabels().forEach((label) => {
                list.push({
                    label: label.name,
                    value: label.label_id,
                    alias: [label.label_id],
                });
            });
            break;
        default:
            break;
    }

    return list.sort((a, b) =>
        (a.label ?? a.value).localeCompare(b.label ?? b.value),
    );
}

function createVirtualSelectOptions(type: IdSelectorType): Record<string, any> {
    switch (type) {
        case IdSelectorType.Device:
        case IdSelectorType.Entity:
            return {
                hasOptionDescription: true,
            };
        case IdSelectorType.Area:
        case IdSelectorType.Floor:
        case IdSelectorType.Label:
        default:
            return {};
    }
}

export function createVirtualSelect(type: IdSelectorType, value: string): any {
    const $div = $('<div>', {
        class: 'virtual-select',
        style: 'flex:1;',
    });

    // @ts-expect-error - VirtualSelect is not recognized
    VirtualSelect.init({
        ele: $div[0],
        hideClearButton: true,
        search: true,
        maxWidth: '100%',
        options: createSelectOptions(type),
        placeholder: '',
        allowNewOption: true,
        optionsCount: 6,
        selectedValue: value,

        ...createVirtualSelectOptions(type),
    });

    return $div;
}
