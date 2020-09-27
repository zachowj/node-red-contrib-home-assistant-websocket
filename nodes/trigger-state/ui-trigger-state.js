RED.nodes.registerType('trigger-state', {
    category: 'home_assistant',
    color: '#038FC7',
    inputs: 1,
    outputs: 2,
    outputLabels: function (index) {
        const NUM_DEFAULT_OUTPUTS = 2;

        if (index === 0) return 'allowed';
        if (index === 1) return 'blocked';

        // Get custom output by length minus default outputs
        const co = this.customoutputs[index - NUM_DEFAULT_OUTPUTS];
        let label;
        if (co.comparatorPropertyType === 'always') {
            label = 'always sent';
        } else {
            label = `${co.comparatorPropertyType.replace(
                '_',
                ' '
            )} ${co.comparatorType.replace('_', '')} ${co.comparatorValue}`;
        }
        return label;
    },
    icon: 'font-awesome/fa-map-signs',
    paletteLabel: 'trigger: state',
    label: function () {
        return this.name || `trigger-state: ${this.entityid}`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        entityid: { value: '', required: true },
        entityidfiltertype: { value: 'exact' },
        debugenabled: { value: false },
        constraints: {
            value: [
                {
                    targetType: 'this_entity',
                    targetValue: '',
                    propertyType: 'current_state',
                    propertyValue: 'new_state.state',
                    comparatorType: 'is',
                    comparatorValueDatatype: 'str',
                    comparatorValue: '',
                },
            ],
        },
        outputs: { value: 2 },
        customoutputs: { value: [] },
        outputinitially: { value: false },
        state_type: { value: 'str' },
    },
    oneditprepare: function () {
        const node = this;
        const $constraintList = $('#constraint-list');
        const $outputList = $('#output-list');

        let availableEntities = [];
        let availableProperties = [];
        let availablePropertiesPrefixed = [];

        haServer.init(node, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            availableEntities = entities;
            $('#node-input-entityid').autocomplete({
                source: entities,
                minLength: 0,
            });
        });
        haServer.autocomplete('properties', (properties) => {
            availableProperties = properties;
            // prefix properties with new_state and old_state
            availablePropertiesPrefixed = [
                ...properties.map((e) => `new_state.${e}`),
                ...properties.map((e) => `old_state.${e}`),
            ].sort();
        });
        exposeNode.init(node);

        const $customOutputs = $('#node-input-outputs').val('{"0": 0, "1": 1}');
        const getOutputs = () => {
            return JSON.parse($customOutputs.val());
        };
        const saveOutputs = (data) => {
            $customOutputs.val(JSON.stringify(data));
        };
        const updateOutputs = (outputs) => {
            const outputItems = $outputList.editableList('items');
            outputItems.each(function (i) {
                const data = $(this).data('data');
                outputs[
                    Object.prototype.hasOwnProperty.call(data, 'index')
                        ? data.index
                        : data._index
                ] = i + 2;
            });
        };

        $constraintList.on('change', '.target-type', function () {
            const $this = $(this);
            const thisEntitySelected = $this.val() === 'this_entity';
            const $parent = $this.parent().parent();
            const $targetValue = $this.next();
            const $propertyType = $parent.find('.property-type');

            if (thisEntitySelected) {
                $targetValue.attr('disabled', 'disabled').val('');
            } else {
                $targetValue.removeAttr('disabled');
            }
            $propertyType
                .find('option[value=previous_state]')
                .toggle(thisEntitySelected);
            if ($propertyType.val() === 'previous_state') {
                $propertyType.val('current_state').trigger('change');
            }
        });
        $constraintList.on('change', '.property-type', function (e) {
            const val = e.target.value;
            if (val === 'current_state' || val === 'previous_state') {
                $(this).next().attr('disabled', 'disabled').val('');
            } else {
                $(this).next().removeAttr('disabled');
            }
        });

        $outputList.on('change', '.comparator-property-type', function (e) {
            const val = e.target.value;
            const $container = $(this).parent().parent();
            const $type = $container.find('.comparator-type');
            const $value = $container.find('.comparator-value');
            const $propertyValue = $container.find(
                '.comparator-property-value'
            );

            switch (val) {
                case 'always':
                    $propertyValue.attr('disabled', 'disabled');
                    $type.attr('disabled', 'disabled');
                    $value.attr('disabled', 'disabled');
                    $propertyValue.val('');
                    break;
                case 'previous_state':
                case 'current_state':
                    $propertyValue.attr('disabled', 'disabled');
                    $type.removeAttr('disabled');
                    $value.removeAttr('disabled');
                    $propertyValue.val('');
                    break;
                case 'property':
                    $propertyValue.removeAttr('disabled');
                    $type.removeAttr('disabled');
                    $value.removeAttr('disabled');
                    break;
            }
        });

        const constraintListAddItem = (container, index, data) => {
            $('#constraint-template').children().clone().appendTo(container);

            container.find('.target-value').autocomplete({
                source: (req, cb) => {
                    const term = req.term.toLowerCase();
                    const filiteredEntities = availableEntities.filter(
                        (entity) => entity.includes(term)
                    );
                    cb(filiteredEntities);
                },
                minLength: 0,
            });
            container.find('.property-value').autocomplete({
                source: (req, cb) => {
                    const term = req.term.toLowerCase();
                    const props =
                        container.find('.target-type').val() === 'this_entity'
                            ? availablePropertiesPrefixed
                            : availableProperties;
                    const filiteredProps = props.filter((prop) =>
                        prop.includes(term)
                    );

                    cb(filiteredProps);
                },
                minLength: 0,
            });
            container.find('.comparator-value').typedInput({
                default: 'str',
                types: [
                    'str',
                    'num',
                    'bool',
                    're',
                    'jsonata',
                    {
                        value: 'entity',
                        label: 'entity.',
                    },
                    {
                        value: 'prevEntity',
                        label: 'prev entity.',
                    },
                ],
            });

            // Add Item clicked
            if ($.isEmptyObject(data)) return;

            container
                .find('.target-type')
                .val(data.targetType)
                .trigger('change');
            container.find('.target-value').val(data.targetValue);
            container
                .find('.property-type')
                .val(data.propertyType)
                .trigger('change');
            if (data.propertyType === 'property') {
                container.find('.property-value').val(data.propertyValue);
            }
            container.find('.comparator-type').val(data.comparatorType);
            container
                .find('.comparator-value')
                .typedInput('type', data.comparatorValueDatatype)
                .typedInput('value', data.comparatorValue);
        };

        $constraintList.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append('Conditions'),
            addItem: constraintListAddItem,
        });

        $constraintList.editableList(
            'addItems',
            this.constraints.length ? this.constraints : {}
        );

        $outputList.on('change', '.message-type', function (e) {
            const val = e.target.value;
            $(this)
                .parent()
                .find('.message-value')
                .typedInput(val === 'default' ? 'hide' : 'show');
        });
        $outputList.on('change', '.comparator-property-type', function (e) {
            const val = e.target.value;
            const $container = $(this).parent().parent();
            const $comparatorPropertyValue = $container.find(
                '.comparator-property-value'
            );
            const $comparatorType = $container.find('.comparator-type');
            const $comparatorValue = $container.find('.comparator-value');

            switch (val) {
                case 'always':
                    $comparatorPropertyValue.attr('disabled', 'disabled');
                    $comparatorType.attr('disabled', 'disabled');
                    $comparatorValue.typedInput('hide');
                    $comparatorPropertyValue.val('');
                    break;
                case 'previous_state':
                case 'current_state':
                    $comparatorPropertyValue.attr('disabled', 'disabled');
                    $comparatorType.removeAttr('disabled');
                    $comparatorValue.typedInput('show');
                    $comparatorPropertyValue.val('');
                    break;
                case 'property':
                    $comparatorPropertyValue.removeAttr('disabled');
                    $comparatorType.removeAttr('disabled');
                    $comparatorValue.typedInput('show');
                    break;
            }
        });

        $outputList.editableList({
            addButton: true,
            removable: true,
            sortable: true,
            height: 'auto',
            header: $('<div>').append('Custom outputs'),
            addItem: function (container, index, opt) {
                if (!Object.prototype.hasOwnProperty.call(opt, 'condition')) {
                    opt.condition = {};
                }
                const data = opt.condition;
                if (!Object.prototype.hasOwnProperty.call(opt, 'index')) {
                    opt._index = Math.floor(
                        (0x99999 - 0x10000) * Math.random()
                    ).toString();
                }

                $('#output-template').children().clone().appendTo(container);

                container.css({
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                });
                container.find('.message-value').typedInput({
                    default: 'json',
                    types: ['str', 'num', 'bool', 'json'],
                });
                container.find('.comparator-property-value').autocomplete({
                    source: (req, cb) => {
                        const term = req.term.toLowerCase();
                        const props = availablePropertiesPrefixed;
                        const filiteredProps = props.filter((prop) =>
                            prop.includes(term)
                        );

                        cb(filiteredProps);
                    },
                    minLength: 0,
                });
                container.find('.comparator-value').typedInput({
                    default: 'str',
                    types: [
                        'str',
                        'num',
                        'bool',
                        're',
                        'jsonata',
                        {
                            value: 'entity',
                            label: 'entity.',
                        },
                        {
                            value: 'prevEntity',
                            label: 'prev entity.',
                        },
                    ],
                });

                const currentOutputs = getOutputs();
                currentOutputs[
                    Object.prototype.hasOwnProperty.call(opt, 'index')
                        ? opt.index
                        : opt._index
                ] = index + 2;
                saveOutputs(currentOutputs);

                // Add Item clicked
                if ($.isEmptyObject(data)) {
                    container
                        .find('.message-type,.comparator-property-type')
                        .trigger('change');

                    return;
                }

                container
                    .find('.message-type')
                    .val(data.messageType)
                    .trigger('change');
                container
                    .find('.message-value')
                    .typedInput('value', data.messageValue)
                    .typedInput('type', data.messageValueType);
                container
                    .find('.comparator-property-type')
                    .val(data.comparatorPropertyType)
                    .trigger('change');
                if (data.comparatorPropertyType === 'property') {
                    container
                        .find('.comparator-property-value')
                        .val(data.comparatorPropertyValue);
                }
                container.find('.comparator-type').val(data.comparatorType);
                container
                    .find('.comparator-value')
                    .typedInput('value', data.comparatorValue)
                    .typedInput('type', data.comparatorValueDataType);
            },
            removeItem: function (opt) {
                const currentOutputs = getOutputs();
                if (Object.prototype.hasOwnProperty.call(opt, 'index')) {
                    currentOutputs[opt.index] = -1;
                } else {
                    delete currentOutputs[opt._index];
                }
                updateOutputs(currentOutputs);
                saveOutputs(currentOutputs);
            },
            sortItems: function () {
                const currentOutputs = getOutputs();
                updateOutputs(currentOutputs);
                saveOutputs(currentOutputs);
            },
        });

        this.customoutputs.forEach((output, index) =>
            $outputList.editableList('addItem', {
                condition: output,
                index: index + 2,
            })
        );
    },
    oneditsave: function () {
        const constraintsItems = $('#constraint-list').editableList('items');
        const outputItems = $('#output-list').editableList('items');
        const constraints = [];
        const outputs = [];

        constraintsItems.each(function () {
            const $this = $(this);
            const $comparatorValue = $this.find('.comparator-value');
            const constraint = {
                targetType: $this.find('.target-type').val(),
                targetValue: $this.find('.target-value').val(),
                propertyType: $this.find('.property-type').val(),
                comparatorType: $this.find('.comparator-type').val(),
                comparatorValueDatatype: $comparatorValue.typedInput('type'),
                comparatorValue: $comparatorValue.typedInput('value'),
            };

            if (constraint.propertyType === 'current_state') {
                constraint.propertyValue = 'new_state.state';
            } else if (constraint.propertyType === 'previous_state') {
                constraint.propertyValue = 'old_state.state';
            } else {
                constraint.propertyValue = $this.find('.property-value').val();
            }

            if (
                constraint.comparatorType === 'includes' ||
                constraint.comparatorType === 'does_not_include'
            ) {
                constraint.comparatorValueDatatype = 'list';
            }

            constraints.push(constraint);
        });
        // Compile Outputs
        outputItems.each(function () {
            const $this = $(this);
            const $message = $this.find('.message-value');
            const $comparatorValue = $this.find('.comparator-value');
            const output = {
                messageType: $this.find('.message-type').val(),
                messageValue: $message.typedInput('value'),
                messageValueType: $message.typedInput('type'),
                comparatorPropertyType: $this
                    .find('.comparator-property-type')
                    .val(),
                comparatorType: $this.find('.comparator-type').val(),
                comparatorValue: $comparatorValue.typedInput('value'),
                comparatorValueDataType: $comparatorValue.typedInput('type'),
            };

            if (output.comparatorPropertyType === 'current_state') {
                output.comparatorPropertyValue = 'new_state.state';
            } else if (output.comparatorPropertyType === 'previous_state') {
                output.comparatorPropertyValue = 'old_state.state';
            } else {
                output.comparatorPropertyValue = $this
                    .find('.comparator-property-value')
                    .val();
            }

            if (
                output.comparatorType === 'includes' ||
                output.comparatorType === 'does_not_include'
            ) {
                output.comparatorValueDataType = 'list';
            }

            outputs.push(output);
        });

        this.constraints = constraints;
        this.customoutputs = outputs;
        this.haConfig = exposeNode.getValues();
    },
});
