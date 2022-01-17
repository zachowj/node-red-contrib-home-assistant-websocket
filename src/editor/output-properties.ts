import { EditorWidgetTypedInputTypeDefinition } from 'node-red';

import { i18n } from './i18n';
import { HATypedInputTypeOptions, OutputProperty } from './types';

const customOutputElement = '#custom-outputs';
let $outputs: JQuery<HTMLElement>;
let _extraTypes: string[] = [];

const customTypes: { [key: string]: EditorWidgetTypedInputTypeDefinition } = {
    config: { value: 'config', label: 'config.', hasValue: true },
    deviceId: { value: 'triggerId', label: 'device id', hasValue: false },
    entity: { value: 'entity', label: 'entity', hasValue: false },
    entityId: { value: 'triggerId', label: 'entity id', hasValue: false },
    entityState: {
        value: 'entityState',
        label: 'entity state',
        hasValue: false,
    },
    eventData: { value: 'eventData', label: 'event data', hasValue: false },
    headers: { value: 'headers', label: 'headers', hasValue: false },
    params: { value: 'params', label: 'params', hasValue: false },
    prevEntity: {
        value: 'prevEntity',
        label: 'previous entity',
        hasValue: false,
    },
    results: { value: 'results', label: 'results', hasValue: false },
    receivedData: {
        value: 'data',
        label: 'received data',
        hasValue: false,
    },
    sentData: { value: 'data', label: 'sent data', hasValue: false },
    tagId: { value: 'triggerId', label: 'tag id', hasValue: false },
    timeSinceChangedMs: {
        value: 'timeSinceChangedMs',
        label: 'timeSinceChangedMs',
        hasValue: false,
    },
    triggerId: { value: 'triggerId', label: 'trigger id', hasValue: false },
};
const defaultTypes: HATypedInputTypeOptions = [
    customTypes.config,
    'flow',
    'global',
    'str',
    'num',
    'bool',
    'date',
    'jsonata',
];

export function createOutputs(
    properties: OutputProperty[] = [],
    {
        element = customOutputElement,
        extraTypes = [],
    }: { element?: string; extraTypes?: string[] } = {}
) {
    $outputs = $(element);
    _extraTypes = extraTypes;

    $outputs.editableList({
        addButton: true,
        removable: true,
        sortable: true,
        height: 'auto',
        header: $('<div>').append(
            i18n('home-assistant.label.output_properties')
        ),
        addItem: function (container, _, data: OutputProperty) {
            container.css({
                overflow: 'hidden',
                whiteSpace: 'nowrap',
            });
            const $row = $('<div />').appendTo(container);
            const propertyName = $('<input/>', {
                class: 'property-name',
                type: 'text',
            })
                .css('width', '30%')
                .appendTo($row)
                .typedInput({ types: ['msg', 'flow', 'global'] });

            $('<div/>', { style: 'display:inline-block; padding:0px 6px;' })
                .text('=')
                .appendTo($row);

            const propertyValue = $('<input/>', {
                class: 'property-value',
                type: 'text',
            })
                .css('width', 'calc(70% - 30px)')
                .appendTo($row)
                .typedInput({
                    default: 'str',
                    types: getTypes(),
                });

            if (data.property) {
                propertyName.typedInput('value', data.property);
            }
            if (data.propertyType) {
                propertyName.typedInput('type', data.propertyType);
            }

            if (data.value) {
                propertyValue.typedInput('value', data.value);
            }
            if (data.valueType) {
                propertyValue.typedInput('type', data.valueType);
            }
        },
    });
    $outputs.editableList('addItems', properties as any[]);
}

function getTypes(): HATypedInputTypeOptions {
    let valueTypes = _extraTypes.reduce((acc, type) => {
        if (type in customTypes) return [...acc, customTypes[type]];

        return acc;
    }, [] as HATypedInputTypeOptions);

    valueTypes = [...valueTypes, ...defaultTypes];
    if (_extraTypes.includes('msg')) {
        const index = valueTypes.indexOf('flow');
        valueTypes.splice(index, 0, 'msg');
    }

    return valueTypes;
}

export function getOutputs() {
    const outputList = $(customOutputElement).editableList('items');
    const outputs: OutputProperty[] = [];
    outputList.each(function () {
        const $property = $(this).find('.property-name');
        const $value = $(this).find('.property-value');
        const property = $property.typedInput('value');
        const propertyType = $property.typedInput('type');
        const value = $value.typedInput('value');
        const valueType = $value.typedInput('type');
        outputs.push({
            property,
            propertyType,
            value,
            valueType,
        });
    });

    return outputs;
}

export function empty() {
    $outputs.empty();
}

export function loadData(data: OutputProperty[]) {
    $outputs.editableList('empty');
    $outputs.editableList('addItems', data);
}

export function setTypes(types: string[]) {
    _extraTypes = types;
}

export function validate(value: string): boolean {
    return (
        value === undefined ||
        (Array.isArray(value) &&
            !value.some((output) => output.property.length === 0))
    );
}
