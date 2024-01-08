import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HATypedInputTypeOptions } from '../../editor/types';
import { OutputType } from './const';
import { Rule } from './types';

declare const RED: EditorRED;

interface GetEntitiesEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    rules: Rule[];
    outputType: OutputType;
    outputEmptyResults: boolean;
    outputLocationType: string;
    outputLocation: string;
    outputResultsCount: number;

    // deprecated
    output_type: undefined;
    output_empty_results: undefined;
    output_location_type: undefined;
    output_location: undefined;
    output_results_count: undefined;
}

const GetEntitiesEditor: EditorNodeDef<GetEntitiesEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-get-entities.svg',
    paletteLabel: 'get entities',
    label: function () {
        return this.name || 'get entities';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haGetEntitiesVersion', 0) },
        rules: {
            value: [{ property: '', logic: 'is', value: '', valueType: 'str' }],
        },
        outputType: { value: OutputType.Array },
        outputEmptyResults: { value: false },
        outputLocationType: { value: 'msg' },
        outputLocation: { value: 'payload' },
        outputResultsCount: {
            value: 1,
            validate: function (v) {
                if ($('#node-input-outputType').val() === OutputType.Random) {
                    return Number.isInteger(Number(v));
                }
                return true;
            },
        },

        // deprecated
        output_type: { value: undefined },
        output_empty_results: { value: undefined },
        output_location_type: { value: undefined },
        output_location: { value: undefined },
        output_results_count: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        const operators = [
            { value: 'is', text: 'is' },
            { value: 'is_not', text: 'is not' },
            { value: 'lt', text: '<' },
            { value: 'lte', text: '<=' },
            { value: 'gt', text: '>' },
            { value: 'gte', text: '>=' },
            { value: 'includes', text: 'in' },
            { value: 'does_not_include', text: 'not in' },
            { value: 'starts_with', text: 'starts with' },
            { value: 'in_group', text: 'in group' },
            { value: 'jsonata', text: 'JSONata' },
        ];
        const typeEntity = { value: 'entity', label: 'entity.' };
        const defaultTypes: HATypedInputTypeOptions = [
            'str',
            'num',
            'bool',
            're',
            'jsonata',
            'msg',
            'flow',
            'global',
            typeEntity,
        ];
        const $logic = $('#logic');

        let availableProperties: string[] = [];
        haServer.init(this, '#node-input-server');
        haServer.autocomplete('properties', (properties: string[]) => {
            availableProperties = properties;
            $('.input-property').autocomplete({
                source: availableProperties,
                minLength: 0,
            });
        });

        $logic.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            addItem: function (container, index, data: Rule) {
                const $row = $('<div />', {
                    class: 'editable-list-row',
                }).appendTo(container);
                const $row2 = $('<div />', {
                    class: 'editable-list-row',
                }).appendTo(container);

                if (!data.hasOwnProperty('logic')) {
                    data.logic = 'is';
                }

                $('<span />', {
                    text: 'Property',
                    style: 'padding-right: 47px;',
                }).appendTo($row);
                const $property = $('<input />', {
                    type: 'text',
                    class: 'input-property',
                    style: 'margin-left: 5px;',
                })
                    .appendTo($row)
                    .val(data.property);

                $property.autocomplete({
                    source: availableProperties,
                    minLength: 0,
                });

                const $logicField = $('<select/>', {
                    style: 'margin-right: 5px;width: auto;',
                })
                    .appendTo($row2)
                    .on('change', function () {
                        const $this = $(this);
                        const val = $this.val() as string;
                        let types = defaultTypes;

                        $property.prop('disabled', val === 'jsonata');

                        switch (val) {
                            case 'is':
                            case 'is_not':
                                break;
                            case 'lt':
                            case 'lte':
                            case 'gt':
                            case 'gte':
                                types = [
                                    'num',
                                    'jsonata',
                                    'msg',
                                    'flow',
                                    'global',
                                    typeEntity,
                                ];
                                break;
                            case 'includes':
                            case 'does_not_include':
                            case 'starts_with':
                            case 'in_group':
                                types = [
                                    'str',
                                    'jsonata',
                                    'msg',
                                    'flow',
                                    'global',
                                    typeEntity,
                                ];
                                break;
                            case 'jsonata':
                                types = ['jsonata'];
                                break;
                        }
                        $value.typedInput('types', types);
                    });

                for (const d in operators) {
                    $logicField.append(
                        $('<option></option>')
                            .val(operators[d].value)
                            .text(operators[d].text),
                    );
                }

                const $value = $('<input />', {
                    class: 'input-value',
                    type: 'text',
                    style: 'width: 70%;',
                })
                    .appendTo($row2)
                    .val(data.value);
                $value.typedInput({ types: defaultTypes });

                $value.typedInput('type', data.valueType);
                $logicField.val(data.logic).trigger('change');
            },
        });

        $logic.editableList('addItems', this.rules);
        $('#node-input-outputLocation').typedInput({
            types: ['msg', 'flow', 'global'],
            typeField: '#node-input-outputLocationType',
        });

        $('#node-input-outputResultsCount').spinner({ min: 1 });

        $('#node-input-outputType')
            .on('change', function () {
                $('.output-option').hide();
                switch ($(this).val() as string) {
                    case OutputType.Array:
                        $('#output_empty_results').show();
                        $('#output_location').show();
                        break;
                    case OutputType.Count:
                        $('#output_location').show();
                        break;
                    case OutputType.Random:
                        $('#output_results_count').show();
                        $('#output_location').show();
                        break;
                    case OutputType.Split:
                    default:
                        break;
                }
            })
            .trigger('change');
    },
    oneditsave: function () {
        const rules = $('#logic').editableList('items');

        this.rules = [];

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        rules.each(function () {
            const $rule = $(this);
            const inputProperty =
                ($rule.find('.input-property').val() as string) ?? '';
            const selectLogic = ($rule.find('select').val() as string) ?? '';
            const inputValue =
                ($rule.find('.input-value').typedInput('value') as string) ??
                '';
            const inputValueType = $rule
                .find('.input-value')
                .typedInput('type');

            self.rules.push({
                property: inputProperty,
                logic: selectLogic,
                value: inputValue,
                valueType: inputValueType,
            });
        });
    },
};

export default GetEntitiesEditor;
