import { PropertySelectorType } from '../../../common/const';
import { ComparatorType, TypedInputTypes } from '../../../const';
import { Rule } from '../../../nodes/get-entities/types';
import * as ha from '../../haserver';
import { i18n } from '../../i18n';
import { HATypedInputTypeOptions } from '../../types';

const operatorsEntity = [
    { value: ComparatorType.Is, text: '==' },
    { value: ComparatorType.IsNot, text: '!=' },
    { value: ComparatorType.IsLessThan, text: '<' },
    { value: ComparatorType.IsLessThanOrEqual, text: '<=' },
    { value: ComparatorType.IsGreaterThan, text: '>' },
    { value: ComparatorType.IsGreaterThanOrEqual, text: '>=' },
    { value: ComparatorType.Includes, text: 'in' },
    { value: ComparatorType.DoesNotInclude, text: 'not in' },
    { value: ComparatorType.StartsWith, text: 'starts with' },
    { value: ComparatorType.InGroup, text: 'in group' },
    { value: ComparatorType.JSONata, text: 'JSONata' },
] as const;
const operatorsRegistry = [
    { value: ComparatorType.Is, text: '==' },
    { value: ComparatorType.IsNot, text: '!=' },
    { value: ComparatorType.Contains, text: 'contains' },
    { value: ComparatorType.DoesNotContain, text: 'does not contain' },
    { value: ComparatorType.Includes, text: 'in' },
    { value: ComparatorType.DoesNotInclude, text: 'not in' },
    { value: ComparatorType.StartsWith, text: 'starts with' },
    { value: ComparatorType.IsNull, text: 'is null' },
    { value: ComparatorType.IsNotNull, text: 'is not null' },
] as const;
const typeEntity = { value: 'entity', label: 'entity.' } as const;
const defaultTypes: HATypedInputTypeOptions = [
    TypedInputTypes.String,
    TypedInputTypes.Number,
    TypedInputTypes.Boolean,
    TypedInputTypes.Regex,
    TypedInputTypes.JSONata,
    TypedInputTypes.Message,
    TypedInputTypes.Flow,
    TypedInputTypes.Global,
    typeEntity,
] as const;
const defaultRegistryTypes: HATypedInputTypeOptions = [
    TypedInputTypes.String,
    TypedInputTypes.JSONata,
    TypedInputTypes.Message,
    TypedInputTypes.Flow,
    TypedInputTypes.Global,
    typeEntity,
] as const;

const selectOptions: Record<PropertySelectorType, string[]> = {
    [PropertySelectorType.State]: [],
    [PropertySelectorType.Floor]: ['aliases', 'floor_id', 'level', 'name'],
    [PropertySelectorType.Area]: ['aliases', 'area_id', 'name'],
    [PropertySelectorType.Device]: [
        'hw_version',
        'id',
        'manufacturer',
        'model',
        'model_id',
        'name',
        'name_by_user',
        'serial_number',
        'sw_version',
    ],
    [PropertySelectorType.Label]: ['description', 'label_id', 'name'],
} as const;

function createRegistryRow(data: Rule): JQuery<HTMLElement>[] {
    if (!data.condition) {
        data.condition = PropertySelectorType.State;
    }

    const $label = $('<span />', {
        text: i18n(
            `home-assistant.component.property-selector.label.${data.condition}_property`,
        ),
        class: 'property-label',
    });

    const $property = $('<select>', {
        class: 'input-property',
    });
    selectOptions[data.condition].forEach((option: string) => {
        $property.append($('<option></option>').val(option).text(option));
    });
    $property.val(data.property);

    const $sel = $('<select>', {
        class: 'input-logic',
    });
    operatorsRegistry.forEach((operator) => {
        $('<option>', {
            value: operator.value,
            text: operator.text,
        }).appendTo($sel);
    });
    if (data.logic) {
        $sel.val(data.logic);
    }

    const $i = $('<input>', {
        type: 'text',
        class: 'input-value',
        css: { width: '100%' },
    })
        .wrap('<div class="input-value-wrapper"></div>')
        .val(data.value);
    $i.typedInput({ types: defaultRegistryTypes });
    $i.typedInput('type', data.valueType);

    return [$label, $property, $sel, $i.parent()];
}

export function getProperties(
    cb: (properties: { label: string; value: string }[]) => void,
): void {
    ha.getItems('properties', (properties) => {
        const filteredProperties = properties.map((item: string) => ({
            value: item,
            label: item,
        }));
        cb(filteredProperties);
    });
}

function createEntityRow(data: Rule): JQuery<HTMLElement>[] {
    if (!data.hasOwnProperty('logic')) {
        data.logic = 'is';
    }

    const $label = $('<span />', {
        text: 'Entity Property',
        class: 'property-label',
    });
    const $property = $('<div />', {
        class: 'input-property virtual-select',
    });
    // @ts-expect-error - VirtualSelect is not recognized
    VirtualSelect.init({
        ele: $property[0],
        hideClearButton: true,
        search: true,
        maxWidth: '100%',
        placeholder: '',
        allowNewOption: true,
        optionsCount: 6,
        selectedValue: data.property,
    });
    getProperties((properties) => {
        // @ts-expect-error - VirtualSelect is not recognized
        $property[0].setOptions(properties, true);
    });

    const $logicField = $('<select/>', { class: 'input-logic' }).on(
        'change',
        function () {
            const $this = $(this);
            const val = $this.val() as string;
            let types = defaultTypes;

            // disable property selector for JSONata
            if (val === ComparatorType.JSONata) {
                // @ts-expect-error - VirtualSelect is not recognized
                $property[0].disable();
                // @ts-expect-error - VirtualSelect is not recognized
                $property[0].reset();
            } else {
                // @ts-expect-error - VirtualSelect is not recognized
                $property[0].enable();
            }

            switch (val) {
                case ComparatorType.Is:
                case ComparatorType.IsNot:
                    break;
                case ComparatorType.IsLessThan:
                case ComparatorType.IsLessThanOrEqual:
                case ComparatorType.IsGreaterThan:
                case ComparatorType.IsGreaterThanOrEqual:
                    types = [
                        TypedInputTypes.Number,
                        TypedInputTypes.JSONata,
                        TypedInputTypes.Message,
                        TypedInputTypes.Flow,
                        TypedInputTypes.Global,
                        typeEntity,
                    ];
                    break;
                case ComparatorType.Includes:
                case ComparatorType.DoesNotInclude:
                case ComparatorType.StartsWith:
                case ComparatorType.InGroup:
                    types = [
                        TypedInputTypes.String,
                        TypedInputTypes.JSONata,
                        TypedInputTypes.Message,
                        TypedInputTypes.Flow,
                        TypedInputTypes.Global,
                        typeEntity,
                    ];
                    break;
                case ComparatorType.JSONata:
                    types = [TypedInputTypes.JSONata];
                    break;
            }
            $value.typedInput('types', types);
        },
    );

    for (const d in operatorsEntity) {
        $logicField.append(
            $('<option></option>')
                .val(operatorsEntity[d].value)
                .text(operatorsEntity[d].text),
        );
    }

    const $value = $('<input />', {
        class: 'input-value',
        type: 'text',
        css: { width: '100%' },
    })
        .wrap('<div class="input-value-wrapper"></div>')
        .val(data.value);
    $value.typedInput({ types: defaultTypes });

    $value.typedInput('type', data.valueType);
    if (data.logic) {
        $logicField.val(data.logic).trigger('change');
    }

    return [$label, $property, $logicField, $value.parent()];
}

export function createRow(data: Rule): JQuery<HTMLElement>[] {
    switch (data.condition) {
        case PropertySelectorType.Area:
        case PropertySelectorType.Device:
        case PropertySelectorType.Floor:
        case PropertySelectorType.Label:
            return createRegistryRow(data);
        case PropertySelectorType.State:
        default:
            return createEntityRow(data);
    }
}
