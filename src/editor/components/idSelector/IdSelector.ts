import { HassEntity } from 'home-assistant-js-websocket';

import { IdSelectorType } from '../../../common/const';
import { ActionTargetFilter } from '../../../nodes/action/editor/targets';
import {
    HassArea,
    HassAreas,
    HassDevice,
    HassFloor,
    HassLabel,
} from '../../../types/home-assistant';
import * as haServer from '../../haserver';
import { i18n } from '../../i18n';
import { createRow } from './elements';
import { createSelectOptions } from './virtual-select';

interface EditableListButton {
    label: string;
    icon: string;
    class: string;
    click: (evt: any) => void;
}
export interface TargetData {
    entities: HassEntity[];
    devices: HassDevice[];
    areas: HassAreas;
    floors: HassFloor[];
    labels: HassLabel[];
}

export default class IdSelector {
    #$element: JQuery<HTMLElement>;
    #headerText: string;
    #types: IdSelectorType[];
    #filter: ActionTargetFilter[];
    #targetData: TargetData;

    constructor({
        types,
        element,
        headerText,
        filter,
    }: {
        types: IdSelectorType[];
        element: string;
        headerText: string;
        filter?: ActionTargetFilter[];
    }) {
        this.#types = types;
        this.#$element = $(element);
        this.#headerText = headerText;
        this.#filter = filter ?? [];
        this.#targetData = this.#createTargetData();

        this.init();
    }

    #createTargetData(): TargetData {
        const entityRegistry = haServer.getEntityRegistry();
        const states = haServer.getEntities();
        const devices = haServer.getDevices();
        const areas = haServer.getAreas();
        const floors = haServer.getFloors();
        const labels = haServer.getLabels();

        if (this.#filter.length === 0) {
            return {
                entities: states,
                devices,
                areas,
                floors,
                labels,
            };
        }

        const filteredEntities: HassEntity[] = [];
        const filteredDevices: HassDevice[] = [];
        const filteredAreas: HassAreas = [];
        const filteredFloors: HassFloor[] = [];
        const filteredLabels: HassLabel[] = [];

        for (const filter of this.#filter) {
            const {
                integration,
                domain,
                device_class: deviceClass,
                supported_features: supportedFeatures,
            } = filter;

            for (const state of states) {
                const entity = entityRegistry.find(
                    (e) => e.entity_id === state.entity_id,
                );

                // Skip entities that are not part of the integration
                if (integration && entity?.platform !== integration) {
                    continue;
                }

                // Skip entities that are not part of the domain
                const entityDomain = state.entity_id.split('.')[0];
                if (domain?.length && !domain.includes(entityDomain)) {
                    continue;
                }

                // Skip entities that are not part of the device class
                if (
                    deviceClass?.length &&
                    state.attributes.device_class !== undefined &&
                    !deviceClass.includes(state.attributes.device_class)
                ) {
                    continue;
                }

                // Skip entities that do not have the supported features
                if (
                    supportedFeatures !== undefined &&
                    state.attributes.supported_features !== undefined &&
                    (state.attributes.supported_features &
                        supportedFeatures) ===
                        0
                ) {
                    continue;
                }

                filteredEntities.push(state);

                // Skip the rest of the checks if the entity is not part of the registry
                if (!entity) {
                    continue;
                }

                // Add devices that the entity is part of
                let device: HassDevice | undefined;
                if (entity.device_id) {
                    device = devices.find((d) => d.id === entity.device_id);
                    if (device) {
                        pushIfNotExist(filteredDevices, device);
                    }
                }

                // Add areas that the entity is part of
                let area: HassArea | undefined;
                const areaId = entity.area_id ?? device?.area_id;
                if (areaId) {
                    area = areas.find((a) => a.area_id === areaId);
                    if (area) {
                        pushIfNotExist(filteredAreas, area);
                    }
                }

                // Add floors that the entity is part of
                if (area?.floor_id) {
                    const floor = floors.find(
                        (f) => f.floor_id === area?.floor_id,
                    );
                    if (floor) {
                        pushIfNotExist(filteredFloors, floor);
                    }
                }

                // Add labels that the entity is part of
                if (entity.labels.length) {
                    for (const label of entity.labels) {
                        const l = labels.find((l) => l.label_id === label);
                        if (l) {
                            filteredLabels.push(l);
                        }
                    }
                }
            }
        }

        return {
            entities: filteredEntities,
            devices: filteredDevices,
            areas: filteredAreas,
            floors: filteredFloors,
            labels: filteredLabels,
        };
    }

    #createAddButton(type: IdSelectorType) {
        const button: EditableListButton = {
            label: i18n(
                `home-assistant.component.id-selector.label.add-button.${type}`,
            ),
            icon: 'fa fa-plus',
            class: 'red-ui-editableList-add',
            click: () => {
                this.#$element.editableList('addItem', { type });
            },
        };

        return button;
    }

    #createAddButtons() {
        const buttons: EditableListButton[] = this.#types.map((type) =>
            this.#createAddButton(type),
        );

        return buttons;
    }

    init() {
        this.#$element.addClass('id-selector');
        this.#$element.editableList({
            addButton: false,
            height: 'auto',
            header: $('<div>').append(this.#headerText),
            addItem: ($container: JQuery<HTMLElement>, _, data: any) => {
                const $elements = createRow(
                    this.#$element,
                    $container,
                    data.type,
                    data.value,
                    this.#targetData,
                );
                $elements.forEach((element) => $container.append(element));
            },
            // @ts-expect-error - editableList is not recognized
            buttons: this.#createAddButtons(),
        });
    }

    addId(type: IdSelectorType, id: string) {
        this.#$element.editableList('addItem', { type, value: id });
    }

    clear() {
        this.#$element.find('.id-delete-button').trigger('click');
    }

    refreshOptions() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _self = this;
        this.#$element.editableList('items').each(function () {
            const $li = $(this);
            const { type } = $li.data('data');

            if (!isIdSelectorType(type)) {
                return;
            }

            const $vs = $li.find('.virtual-select');
            if ($vs.length) {
                const options = createSelectOptions(_self.#targetData, type);
                // @ts-expect-error - setOptions is not recognized
                $vs[0].setOptions(options, true);
            }
        });
    }

    updateFilter(filter: ActionTargetFilter[]) {
        this.#filter = filter;
        this.#targetData = this.#createTargetData();
        this.refreshOptions();
    }
}

function isIdSelectorType(value: string): value is IdSelectorType {
    return Object.values(IdSelectorType).includes(value as IdSelectorType);
}

interface SelectedIds {
    [IdSelectorType.Floor]: string[];
    [IdSelectorType.Area]: string[];
    [IdSelectorType.Device]: string[];
    [IdSelectorType.Entity]: string[];
    [IdSelectorType.Label]: string[];
    [IdSelectorType.Substring]: string[];
    [IdSelectorType.Regex]: string[];
}

export function getSelectedIds(elementId: string): SelectedIds {
    const items = $(elementId).editableList('items');
    // create a Set to store ids
    const selectedIds = {
        [IdSelectorType.Floor]: new Set<string>(),
        [IdSelectorType.Area]: new Set<string>(),
        [IdSelectorType.Device]: new Set<string>(),
        [IdSelectorType.Entity]: new Set<string>(),
        [IdSelectorType.Label]: new Set<string>(),
        [IdSelectorType.Substring]: new Set<string>(),
        [IdSelectorType.Regex]: new Set<string>(),
    };

    items.each(function () {
        const { type } = $(this).data('data');

        if (!isIdSelectorType(type)) {
            return;
        }

        let value = '';
        switch (type) {
            case IdSelectorType.Entity:
            case IdSelectorType.Device:
            case IdSelectorType.Area:
            case IdSelectorType.Floor:
            case IdSelectorType.Label: {
                const $vs = $(this).find('.virtual-select');
                // @ts-expect-error - value is not recognized
                value = $vs[0].value as string;
                break;
            }
            case IdSelectorType.Substring:
            case IdSelectorType.Regex: {
                const $input = $(this).find('.id-selector-regex');
                value = $input.val() as string;
                break;
            }
            default:
                break;
        }

        if (value.length) {
            selectedIds[type].add(value);
        }
    });

    return {
        [IdSelectorType.Floor]: Array.from(selectedIds[IdSelectorType.Floor]),
        [IdSelectorType.Area]: Array.from(selectedIds[IdSelectorType.Area]),
        [IdSelectorType.Device]: Array.from(selectedIds[IdSelectorType.Device]),
        [IdSelectorType.Entity]: Array.from(selectedIds[IdSelectorType.Entity]),
        [IdSelectorType.Label]: Array.from(selectedIds[IdSelectorType.Label]),
        [IdSelectorType.Substring]: Array.from(
            selectedIds[IdSelectorType.Substring],
        ),
        [IdSelectorType.Regex]: Array.from(selectedIds[IdSelectorType.Regex]),
    };
}

// Push an element to an array if it does not exist
function pushIfNotExist<T>(array: T[], element: T) {
    if (!array.includes(element)) {
        array.push(element);
    }
}
