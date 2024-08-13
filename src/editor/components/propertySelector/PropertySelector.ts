import { PropertySelectorType } from '../../../common/const';
import { Rule } from '../../../nodes/get-entities/types';
import { i18n } from '../../i18n';
import { createRow, getProperties } from './elements';

interface EditableListButton {
    label: string;
    icon: string;
    class: string;
    click: (evt: any) => void;
}

export default class PropertySelector {
    #$element: JQuery<HTMLElement>;
    #types: PropertySelectorType[];

    constructor({
        types,
        element,
    }: {
        types: PropertySelectorType[];
        element: string;
    }) {
        this.#types = types;
        this.#$element = $(element);

        this.init();
    }

    #createAddButton(type: PropertySelectorType) {
        const button: EditableListButton = {
            label: i18n(
                `home-assistant.component.property-selector.label.add-button.${type}`,
            ),
            icon: 'fa fa-plus',
            class: 'red-ui-editableList-add',
            click: () => {
                this.#$element.editableList('addItem', { condition: type });
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
        this.#$element.addClass('property-selector');
        this.#$element.editableList({
            addButton: false,
            removable: true,
            height: 'auto',
            addItem: ($container: JQuery<HTMLElement>, _, condition: Rule) => {
                const $elements = createRow(condition);
                $elements.forEach((element) => $container.append(element));
                $container.addClass('property-selector');
            },
            // @ts-expect-error - editableList is not recognized
            buttons: this.#createAddButtons(),
        });
    }

    addId(rule: Rule) {
        if (!rule.condition) {
            rule.condition = PropertySelectorType.State;
        }

        this.#$element.editableList('addItem', rule);
    }

    clear() {
        this.#$element.find('.id-delete-button').trigger('click');
    }

    refreshOptions() {
        this.#$element.editableList('items').each(function () {
            const $li = $(this);
            const { condition } = $li.data('data');

            if (!isPropertySelectorType(condition)) {
                return;
            }

            const $vs = $li.find('.virtual-select');
            if ($vs.length) {
                getProperties((options) => {
                    // @ts-expect-error - setOptions is not recognized
                    $vs[0].setOptions(options, true);
                });
            }
        });
    }
}

function isPropertySelectorType(value: unknown): value is PropertySelectorType {
    return Object.values(PropertySelectorType).includes(
        value as PropertySelectorType,
    );
}

function getRegistryRule(
    element: HTMLElement,
    type: PropertySelectorType,
): Rule {
    const $rule = $(element);
    const selectProperty = $rule.find('select.input-property').val() as string;
    const selectLogic = $rule.find('select.input-logic').val() as string;
    const $value = $rule.find('input.input-value');
    const inputValue = $value.typedInput('value');
    const inputValueType = $value.typedInput('type');

    return {
        condition: type,
        property: selectProperty,
        logic: selectLogic,
        value: inputValue,
        valueType: inputValueType,
    };
}
function getEntityRule(element: HTMLElement): Rule {
    const $rule = $(element);
    // @ts-expect-error - VirtualSelect is not recognized
    const inputProperty = $rule.find('.input-property')[0].value;
    const selectLogic = $rule.find('select.input-logic').val() as string;
    const inputValue = $rule.find('.input-value').typedInput('value');
    const inputValueType = $rule.find('.input-value').typedInput('type');

    return {
        condition: PropertySelectorType.State,
        property: inputProperty,
        logic: selectLogic,
        value: inputValue,
        valueType: inputValueType,
    };
}

function isRule(rule: Rule): rule is Rule {
    return (
        isPropertySelectorType(rule.condition) &&
        rule.property !== undefined &&
        rule.logic !== undefined &&
        rule.value !== undefined &&
        rule.valueType !== undefined
    );
}

export function getRules(elementId: string): Rule[] {
    const items = $(elementId).editableList('items');
    const rules: Rule[] = [];

    items.each(function () {
        const { condition } = $(this).data('data');
        let rule: Rule;
        switch (condition) {
            case PropertySelectorType.Device:
            case PropertySelectorType.Area:
            case PropertySelectorType.Floor:
            case PropertySelectorType.Label:
                rule = getRegistryRule(this, condition);
                break;
            case PropertySelectorType.State:
            default:
                rule = getEntityRule(this);
                break;
        }

        if (isRule(rule)) {
            rules.push(rule);
        }
    });

    return rules;
}
