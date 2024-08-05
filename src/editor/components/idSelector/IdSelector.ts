import { i18n } from '../../i18n';
import { createRow } from './elements';
import { IdSelectorType } from './types';
import { createSelectOptions } from './virtual-select';

interface EditableListButton {
    label: string;
    icon: string;
    class: string;
    click: (evt: any) => void;
}

export default class IdSelector {
    #$element: JQuery<HTMLElement>;
    #headerText: string;
    #types: IdSelectorType[];

    constructor({
        types,
        element,
        headerText,
    }: {
        types: IdSelectorType[];
        element: string;
        headerText: string;
    }) {
        this.#types = types;
        this.#$element = $(element);
        this.#headerText = headerText;

        this.init();
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
        // padding: 4px 0px 8px;
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
        this.#$element.editableList('items').each(function () {
            const $li = $(this);
            const { type } = $li.data('data');

            if (!isIdSelectorType(type)) {
                return;
            }

            const $vs = $li.find('.virtual-select');
            if ($vs.length) {
                const options = createSelectOptions(type);
                // @ts-expect-error - setOptions is not recognized
                $vs[0].setOptions(options, true);
            }
        });
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

        switch (type) {
            case IdSelectorType.Entity:
            case IdSelectorType.Device:
            case IdSelectorType.Area:
            case IdSelectorType.Floor:
            case IdSelectorType.Label: {
                const $vs = $(this).find('.virtual-select');
                // @ts-expect-error - value is not recognized
                const value = $vs[0].value as string;
                if (value.length) {
                    selectedIds[type].add(value);
                }
                break;
            }
            case IdSelectorType.Substring:
            case IdSelectorType.Regex:
            default:
                break;
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
