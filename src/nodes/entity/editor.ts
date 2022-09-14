import { EditorNodeDef, EditorRED, EditorWidgetTypedInputType } from 'node-red';

import * as exposeNode from '../../editor/exposenode';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import {
    HassExposedConfig,
    HassNodeProperties,
    HATypedInputTypeOptions,
} from '../../editor/types';

declare const RED: EditorRED;

interface EntityAttribute {
    property: string;
    value: string;
    valueType: string;
}

type StateType = 'binary_sensor' | 'sensor' | 'switch';

type WidgetTypedInputType = EditorWidgetTypedInputType | 'none';

interface EntityEditorNodeProperties extends HassNodeProperties {
    entityType: string;
    config: HassExposedConfig[];

    // sensor binary_sensor
    state: string;
    stateType: WidgetTypedInputType;
    attributes: EntityAttribute[];
    resend: boolean;
    outputLocation: string;
    outputLocationType: WidgetTypedInputType;
    inputOverride: string;
    // switch
    outputOnStateChange: null;
    outputPayload: null;
    outputPayloadType: null;
}

const stateTypes = {
    binary_sensor: ['msg', 'flow', 'global', 'jsonata', 'str', 'num', 'bool'],
    sensor: ['msg', 'flow', 'global', 'jsonata', 'str', 'num', 'bool', 'date'],
    switch: ['msg'],
};
const haConfigOptions = {
    binary_sensor: ['name', 'device_class', 'icon', 'unit_of_measurement'],
    sensor: [
        'name',
        'device_class',
        'icon',
        'unit_of_measurement',
        'state_class',
        'last_reset',
    ],
    switch: ['name', 'icon'],
};
const attributeTypes: HATypedInputTypeOptions = [
    'str',
    'num',
    'bool',
    'date',
    'jsonata',
    'msg',
    'flow',
    'global',
];
const rows = {
    binary_sensor: [
        'state',
        'attributes',
        'output-location',
        'input-override',
        'resend',
        'debug',
    ],
    sensor: [
        'state',
        'attributes',
        'output-location',
        'input-override',
        'resend',
        'debug',
    ],
    switch: ['output-on-state-change', 'output-payload'],
};

const EntityEditor: EditorNodeDef<EntityEditorNodeProperties> = {
    category: 'home_assistant_deprecated',
    color: ha.nodeColors.deprecated,
    inputs: 1,
    outputs: 1,
    // @ts-ignore - DefinitelyTyped is wrong icon can be a function
    icon: function (this: NodeInstance<EntityEditorNodeProperties>): string {
        return this?.entityType === 'switch'
            ? 'ha-entity-switch.svg'
            : 'font-awesome/fa-genderless';
    },
    align: 'right',
    paletteLabel: 'entity',
    label: function () {
        return this.name || `type: ${this.entityType}`;
    },
    labelStyle: function () {
        return this.name ? 'node_label_italic' : '';
    },
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('haEntityVersion', 0) },
        debugenabled: { value: false },
        outputs: { value: 1 },
        entityType: { value: 'sensor' },
        config: {
            value: [
                { property: 'name', value: '' },
                { property: 'device_class', value: '' },
                { property: 'icon', value: '' },
                { property: 'unit_of_measurement', value: '' },
                { property: 'state_class', value: '' },
                { property: 'last_reset', value: '' },
            ],
        },
        // sensor binary_sensor
        state: { value: 'payload' },
        stateType: { value: 'msg' },
        attributes: { value: [] },
        resend: { value: true },
        outputLocation: { value: 'payload' },
        outputLocationType: { value: 'none' },
        inputOverride: { value: 'allow' },
        // switch
        outputOnStateChange: { value: null },
        outputPayload: { value: null },
        outputPayloadType: { value: null },
    },
    oneditprepare: function () {
        if (this.version >= RED.settings.get('haEntityVersion', 0)) {
            $('#ha-entity-removed').hide().after(`
            <div>
                This node has been deperacated in favor of the indivdual entity nodes.
            </div>
            `);
            return;
        }
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        const $inputState = $('#node-input-state');
        $inputState.typedInput({
            types: stateTypes[
                $('#node-input-entityType').val() as StateType
            ] as any,
            typeField: '#node-input-stateType',
            // @ts-ignore - DefinitelyTyped is wrong typedInput can take a object as a parameter
            type: this.stateType,
        });

        $('#attributes')
            .editableList({
                removable: true,
                addButton: 'add attribute',
                header: $('<div>').append(
                    $.parseHTML(
                        "<div style='width:40%; display: inline-grid'>Attribute Key</div><div style='display: inline-grid'>Value</div>"
                    )
                ),
                addItem: function (container, _, data: EntityAttribute) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        style: 'width: 40%;margin-right: 5px;',
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row)
                        .val(data.property);
                    const $value = $('<input />', {
                        type: 'text',
                        name: 'value',
                        style: 'width: 55%;',
                    })
                        .appendTo($row)
                        .val(data.value);

                    $value.typedInput({
                        types: attributeTypes,
                    });
                    $value.typedInput('type', data.valueType);
                },
            })
            .editableList('addItems', this.attributes);

        $('#haConfig')
            .editableList({
                addButton: false,
                header: $('<div>Home Assistant Config (optional)</div>'),
                addItem: function (container, _, data: HassExposedConfig) {
                    const $row = $('<div />').appendTo(container);
                    const $label = $('<label>').appendTo($row);

                    $('<span>')
                        .text(data.property.replace(/_/g, ' '))
                        .appendTo($label);

                    $('<input />', {
                        type: 'hidden',
                        name: 'property',
                        value: data.property,
                    }).appendTo($label);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($label);
                },
            })
            .editableList('addItems', this.config);

        const noneTypedInput = {
            value: 'none',
            label: 'none',
            hasValue: false,
        };
        $('#node-input-outputLocation').typedInput({
            types: ['msg', 'flow', 'global', noneTypedInput],
            typeField: '#node-input-outputLocationType',
        });

        $('#node-input-outputPayload').typedInput({
            types: ['str', 'num', 'bool', 'jsonata', 'date', noneTypedInput],
            typeField: '#node-input-outputPayloadType',
        });

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        $('#node-input-entityType')
            .on('change', function () {
                const value = $(this).val() as StateType;

                $('#node-input-state').typedInput(
                    'types',
                    stateTypes[value] as any
                );

                // Show/hide rows optional-row based on the rows map
                $('#dialog-form .form-row').each(function () {
                    const $this = $(this);
                    const classes = $this.attr('class')?.split(' ');
                    if (classes?.includes('optional-row')) {
                        const id = $this.attr('id');
                        if (id) {
                            $this.toggle(
                                rows[value].includes(id.replace(/-row$/, ''))
                            );
                        }
                    }
                });

                // Filter config options
                $('#haConfig').editableList('filter', (data) =>
                    haConfigOptions[value].includes(
                        (data as HassExposedConfig).property
                    )
                );

                switch (value) {
                    case 'switch':
                        self.outputs = 2;
                        break;
                    case 'binary_sensor':
                    case 'sensor':
                    default:
                        self.outputs = 1;
                        $('#node-input-outputOnStateChange')
                            .prop('checked', false)
                            .trigger('change');
                        break;
                }
            })
            .trigger('change');

        $('#node-input-outputOnStateChange')
            .on('change', function () {
                if (
                    $('#node-input-entityType').val() === 'switch' &&
                    $(this).prop('checked')
                ) {
                    $('#output-payload-row').show();
                } else {
                    $('#output-payload-row').hide();
                }
            })
            .trigger('change');
    },
    oneditsave: function () {
        this.attributes = [];
        this.config = [];

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        $('#attributes')
            .editableList('items')
            .each(function () {
                const $row = $(this);
                self.attributes.push({
                    property: $row.find('input[name=property]').val() as string,
                    value: $row.find('input[name=value]').typedInput('value'),
                    valueType: $row
                        .find('input[name=value]')
                        .typedInput('type'),
                });
            });

        $('#haConfig')
            .editableList('items')
            .each(function () {
                const $row = $(this);
                self.config.push({
                    property: $row.find('input[name=property]').val() as string,
                    value: $row.find('input[name=value]').val() as string,
                });
            });
    },
};

export default EntityEditor;
