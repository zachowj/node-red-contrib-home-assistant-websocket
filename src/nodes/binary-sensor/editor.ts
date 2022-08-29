import { EditorNodeDef, EditorRED, EditorWidgetTypedInputType } from 'node-red';

import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import {
    HassNodeProperties,
    HATypedInputTypeOptions,
    OutputProperty,
} from '../../editor/types';

declare const RED: EditorRED;

interface EntityAttribute {
    property: string;
    value: string;
    valueType: EditorWidgetTypedInputType;
}

interface BinarySensorEditorNodeProperties extends HassNodeProperties {
    entityConfig: any;
    state: string;
    stateType: EditorWidgetTypedInputType;
    attributes: EntityAttribute[];
    inputOverride: string;
    outputProperties: OutputProperty[];
}

const stateTypes: HATypedInputTypeOptions = [
    'msg',
    'flow',
    'global',
    'jsonata',
    'str',
    'num',
    'bool',
];

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

const BinarySensorEditor: EditorNodeDef<BinarySensorEditorNodeProperties> = {
    category: 'home_assistant_entities',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-genderless',
    align: 'right',
    paletteLabel: 'binary sensor',
    label: function () {
        return this.name || 'binary sensor';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        entityConfig: {
            value: '',
            type: 'ha-entity-config',
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === 'binary_sensor',
            required: true,
        },
        version: { value: RED.settings.get('haBinarySensorVersion', 0) },
        state: { value: 'payload' },
        stateType: { value: 'msg' },
        attributes: { value: [] },
        inputOverride: { value: 'allow' },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                },
                {
                    property: 'data',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entity',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        const $inputState = $('#node-input-state');
        $inputState.typedInput({
            types: stateTypes,
            typeField: '#node-input-stateType',
            // @ts-expect-error - DefinitelyTyped is wrong typedInput can take a object as a parameter
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
        haOutputs.createOutputs(this.outputProperties);
    },
    oneditsave: function () {
        this.attributes = [];

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
                        .typedInput('type') as EditorWidgetTypedInputType,
                });
            });

        this.outputProperties = haOutputs.getOutputs();
    },
};

export default BinarySensorEditor;
