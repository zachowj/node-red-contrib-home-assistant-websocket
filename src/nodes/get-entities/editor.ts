import {
    EditorNodeDef,
    EditorNodeProperties,
    EditorRED,
    EditorWidgetTypedInputType,
} from 'node-red';

import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HATypedInputTypeOptions } from '../../editor/types';

declare const RED: EditorRED;

type Rule = {
    property: string;
    logic: string;
    value: string;
    valueType: EditorWidgetTypedInputType | string;
};

interface GetEntitiesEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    rules: Rule[];
    output_type: string;
    output_empty_results: boolean;
    output_location_type: string;
    output_location: string;
    output_results_count: number;
}

const GetEntitiesEditor: EditorNodeDef<GetEntitiesEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
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
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('haGetEntitiesVersion', 0) },
        rules: {
            value: [{ property: '', logic: 'is', value: '', valueType: 'str' }],
        },
        output_type: { value: 'array' },
        output_empty_results: { value: false },
        output_location_type: { value: 'msg' },
        output_location: { value: 'payload' },
        output_results_count: {
            value: 1,
            validate: function (v) {
                if ($('#node-input-output_type').val() === 'random') {
                    return Number.isInteger(Number(v));
                }
                return true;
            },
        },
    },
    oneditprepare: function () {
        ha.setup();
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
                            .text(operators[d].text)
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
        $('#node-input-output_location').typedInput({
            types: ['msg', 'flow', 'global'],
            typeField: '#node-input-output_location_type',
        });

        $('#node-input-output_results_count').spinner({ min: 1 });

        $('#node-input-output_type')
            .on('change', function () {
                $('.output-option').hide();
                switch ($(this).val() as string) {
                    case 'array':
                        $('#output_empty_results').show();
                        $('#output_location').show();
                        break;
                    case 'count':
                        $('#output_location').show();
                        break;
                    case 'random':
                        $('#output_results_count').show();
                        $('#output_location').show();
                        break;
                    case 'split':
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
