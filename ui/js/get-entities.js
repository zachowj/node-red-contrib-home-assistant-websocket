RED.nodes.registerType('ha-get-entities', {
    category: 'home_assistant',
    color: '#5BCBF7',
    inputs: 1,
    outputs: 1,
    icon: 'ha-get-entities.svg',
    paletteLabel: 'get entities',
    label: function () {
        return this.name || 'get entities';
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        server: { value: '', type: 'server', required: true },
        name: { value: '' },
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
        const NODE = this;
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
        const defaultTypes = [
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

        let availableProperties = [];
        haServer.init(NODE, '#node-input-server');
        haServer.autocomplete('properties', (entities) => {
            availableProperties = entities;
            $('.input-property').autocomplete({
                source: availableProperties,
                minLength: 0,
            });
        });

        $logic.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            addItem: function (container, index, data) {
                const $row = $('<div />', {
                    class: 'editable-list-row',
                }).appendTo(container);
                const $row2 = $('<div />', {
                    class: 'editable-list-row',
                }).appendTo(container);

                if (!Object.prototype.hasOwnProperty.call(data, 'logic')) {
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
                    .change(function (e) {
                        let types = defaultTypes;

                        $property.prop(
                            'disabled',
                            e.target.value === 'jsonata'
                        );

                        switch (e.target.value) {
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
                    .val(data.value)
                    .typedInput({ types: defaultTypes });

                $value.typedInput('type', data.valueType);
                $logicField.val(data.logic).trigger('change');
            },
        });

        $logic.editableList('addItems', NODE.rules);
        $('#node-input-output_location').typedInput({
            types: ['msg', 'flow', 'global'],
            typeField: '#node-input-output_location_type',
        });

        $('#node-input-output_results_count').spinner({ min: 1 });

        $('#node-input-output_type')
            .on('change', function (e) {
                $('.output-option').hide();
                switch (e.target.value) {
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
        const NODE = this;
        NODE.rules = [];

        rules.each(function (i) {
            const $rule = $(this);
            const inputProperty = $rule.find('.input-property').val();
            const selectLogic = $rule.find('select').val();
            const inputValue = $rule.find('.input-value').typedInput('value');
            const inputValueType = $rule
                .find('.input-value')
                .typedInput('type');

            NODE.rules.push({
                property: inputProperty,
                logic: selectLogic,
                value: inputValue,
                valueType: inputValueType,
            });
        });
    },
});
