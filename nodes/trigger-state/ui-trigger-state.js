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
        constraints: { value: [] },
        constraintsmustmatch: { value: 'all' },
        outputs: { value: 2 },
        customoutputs: { value: [] },
        outputinitially: { value: false },
        state_type: { value: 'str' },
    },
    oneditprepare: function () {
        // Outputs List
        const node = this;
        const NUM_DEFAULT_OUTPUTS = 2;

        const $entityid = $('#node-input-entityid');
        const $entityidfiltertype = $('#node-input-entityidfiltertype');
        const $outputs = $('#node-input-outputs');
        const $accordionContraint = $('#add-constraint-container');
        const $accordionOutput = $('#add-output-container');

        this.entityidfiltertype = this.entityidfiltertype || 'exact';
        $entityidfiltertype.val(this.entityidfiltertype);

        const $constraints = {
            list: $('#constraint-list'),
            addBtn: $('#constraint-add-btn'),

            targetType: $('#constraint-target-type'),
            targetValue: $('#constraint-target-value'),
            propertyType: $('#constraint-property-type'),
            propertyValue: $('#constraint-property-value'),
            comparatorType: $('#constraint-comparator-type'),
            comparatorValue: $('#constraint-comparator-value'),
        };

        const $customoutputs = {
            list: $('#output-list'),
            addBtn: $('#output-add-btn'),

            messageType: $('#output-message-type'),
            messageValue: $('#output-message-value'),
            messageValueType: $('#output-message-value-type'),

            comparatorPropertyType: $('#output-comparator-property-type'),
            comparatorPropertyValue: $('#output-comparator-property-value'),
            comparatorType: $('#output-comparator-type'),
            comparatorValue: $('#output-comparator-value'),
        };

        const utils = {
            getRandomId: () => Math.random().toString(36).slice(2),
        };

        let availableProperties = [];
        let availablePropertiesPrefixes = [];
        haServer.init(node, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            node.availableEntities = entities;
            $entityid.autocomplete({
                source: node.availableEntities,
                minLength: 0,
            });
            $('#constraint-target-value').autocomplete({
                source: node.availableEntities,
                minLength: 0,
            });
        });
        haServer.autocomplete('properties', (properties) => {
            availableProperties = properties;
            // prefix properties with new_state and old_state
            availablePropertiesPrefixes = []
                .concat(
                    properties.map((e) => `new_state.${e}`),
                    properties.map((e) => `old_state.${e}`)
                )
                .sort();
            $(
                '#constraint-property-value,#output-comparator-property-value'
            ).autocomplete({
                source: availablePropertiesPrefixes,
                minLength: 0,
            });
            $('#constraint-target-type').on('change', function () {
                $('#constraint-property-value').autocomplete('option', {
                    source:
                        $(this).val() === 'this_entity'
                            ? availablePropertiesPrefixes
                            : availableProperties,
                });
            });
        });

        // **************************
        // * Add Constraints
        // **************************
        const constraintsHandler = {
            onTargetTypeChange: function (e) {
                const val = e.target.value;
                if (val === 'this_entity') {
                    $constraints.targetValue
                        .attr('disabled', 'disabled')
                        .val('');
                    $constraints.propertyType
                        .find('option[value=previous_state]')
                        .show();
                } else {
                    $constraints.targetValue.removeAttr('disabled');
                    $constraints.propertyType
                        .val('current_state')
                        .find('option[value=previous_state]')
                        .hide()
                        .trigger('change');
                }
            },
            onPropertyTypeChange: function (e) {
                const val = e.target.value;
                if (val === 'current_state' || val === 'previous_state') {
                    $constraints.propertyValue
                        .attr('disabled', 'disabled')
                        .val('');
                } else {
                    $constraints.propertyValue.removeAttr('disabled');
                }
            },
            onComparatorTypeChange: function (e) {
                // const val = e.target.value; // Placeholder
            },
            onAddConstraintButton: function (e) {
                const constraint = {
                    id: utils.getRandomId(),
                    targetType: $constraints.targetType.val(),
                    targetValue: $constraints.targetValue.val(),
                    propertyType: $constraints.propertyType.val(),
                    propertyValue: $constraints.propertyValue.val(),
                    comparatorType: $constraints.comparatorType.val(),
                    comparatorValueDatatype: $constraints.comparatorValue.typedInput(
                        'type'
                    ),
                    comparatorValue: $constraints.comparatorValue.typedInput(
                        'value'
                    ),
                };

                if (constraint.propertyType === 'current_state')
                    constraint.propertyValue = 'new_state.state';
                if (constraint.propertyType === 'previous_state')
                    constraint.propertyValue = 'old_state.state';

                if (
                    constraint.comparatorType === 'includes' ||
                    constraint.comparatorType === 'does_not_include'
                ) {
                    constraint.comparatorValueDatatype = 'list';
                }

                $constraints.list.editableList('addItem', constraint);
                $constraints.targetValue.val('');
            },
            onEditableListAdd: function (row, index, data) {
                const $row = $(row);
                const {
                    targetType,
                    targetValue,
                    propertyType,
                    propertyValue,
                    comparatorType,
                    comparatorValue,
                    comparatorValueDatatype,
                } = data;

                const entityText =
                    targetType === 'this_entity'
                        ? '<strong>This entity&#8217;s</strong>'
                        : `Entity ID <strong>${targetValue}</strong>`;
                const propertyText =
                    propertyType === 'property'
                        ? propertyValue
                        : propertyType.replace('_', ' ');

                const comparatorTypeText = comparatorType.replace('_', ' ');
                const comparatorText = `${comparatorTypeText} <strong>${comparatorValue}</strong> (${comparatorValueDatatype})`;

                const rowHtml = `${entityText} ${propertyText} ${comparatorText}`;
                $row.html(rowHtml);
            },
        };

        // Constraint select menu change handlers
        $constraints.targetType.on(
            'change',
            constraintsHandler.onTargetTypeChange
        );
        $constraints.propertyType.on(
            'change',
            constraintsHandler.onPropertyTypeChange
        );
        $constraints.comparatorType.on(
            'change',
            constraintsHandler.onComparatorTypeChange
        );

        $constraints.addBtn.on(
            'click',
            constraintsHandler.onAddConstraintButton
        );

        // Constraints List
        $constraints.list.editableList({
            addButton: false,
            height: 159,
            sortable: true,
            removable: true,
            addItem: constraintsHandler.onEditableListAdd,
        });

        $constraints.comparatorValue.typedInput({
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
        $constraints.comparatorValue.typedInput('width', '233px');

        // **************************
        // * Add Custom Outputs
        // **************************
        const outputsHandler = {
            onAddButtonClicked: function () {
                const output = {
                    outputId: utils.getRandomId(),

                    messageType: $customoutputs.messageType.val(),
                    messageValue: $customoutputs.messageValue.val(),
                    messageValueType: $customoutputs.messageValueType.val(),

                    comparatorPropertyType: $customoutputs.comparatorPropertyType.val(),
                    comparatorPropertyValue: $customoutputs.comparatorPropertyValue.val(),

                    comparatorType: $customoutputs.comparatorType.val(),
                    comparatorValue: $customoutputs.comparatorValue.val(),
                };

                // Removing an output and adding in same edit session means output
                // map needs to be adjusted, otherwise just increment count
                if (isNaN(node.outputs)) {
                    const maxOutput = Math.max(Object.keys(node.outputs));
                    node.outputs[utils.getRandomId()] = maxOutput + 1;
                } else {
                    node.outputs = parseInt(node.outputs) + 1;
                }
                $outputs.val(
                    isNaN(node.outputs)
                        ? JSON.stringify(node.outputs)
                        : node.outputs
                );

                if (output.comparatorPropertyType === 'current_state')
                    output.comparatorPropertyValue = 'new_state.state';
                if (output.comparatorPropertyType === 'previous_state')
                    output.comparatorPropertyValue = 'old_state.state';

                node.customoutputs.push(output);

                $customoutputs.list.editableList('addItem', output);
            },
            onEditableListAdd: function (row, index, d) {
                const $row = $(row);

                const messageText =
                    d.messageType === 'default'
                        ? 'default message'
                        : d.messageValue;

                const sendWhenText =
                    d.comparatorPropertyType === 'always'
                        ? 'always'
                        : `${
                              d.comparatorPropertyValue
                          } ${d.comparatorType.replace('_', '')} ${
                              d.comparatorValue
                          }`;

                const where =
                    d.messageType === 'default'
                        ? 'Send'
                        : d.messageType === 'custom'
                        ? 'Msg'
                        : 'Payload';

                const html = `${where} <strong>${messageText}</strong>, if <strong>${sendWhenText}</strong>`;

                $row.html(html);
            },
            onEditableListRemove: function (data) {
                // node-red uses a map of old output index to new output index to re-map
                // links between nodes. If new index is -1 then it was removed

                const customOutputRemovedIndex = node.customoutputs.indexOf(
                    data
                );
                node.outputs = !isNaN(node.outputs)
                    ? {
                          0: 0,
                          1: 1,
                      }
                    : node.outputs;
                node.outputs[
                    customOutputRemovedIndex + NUM_DEFAULT_OUTPUTS
                ] = -1;

                node.customoutputs.forEach((o, customOutputIndex) => {
                    const customAllIndex =
                        customOutputIndex + NUM_DEFAULT_OUTPUTS;
                    const outputIsBeforeRemoval =
                        customOutputIndex < customOutputRemovedIndex;
                    const customOutputAlreadyMapped = Object.prototype.hasOwnProperty.call(
                        node.outputs,
                        'customAllIndex'
                    );

                    // If we're on removed output
                    if (customOutputIndex === customOutputRemovedIndex) return;
                    // output already removed
                    if (
                        customOutputAlreadyMapped &&
                        node.outputs[customAllIndex] === -1
                    )
                        return;
                    // output previously removed caused this output to be remapped
                    if (customOutputAlreadyMapped) {
                        node.outputs[customAllIndex] = outputIsBeforeRemoval
                            ? node.outputs[customAllIndex]
                            : node.outputs[customAllIndex] - 1;
                        return;
                    }

                    // output exists after removal and hasn't been mapped, remap to current index - 1
                    node.outputs[customAllIndex] = outputIsBeforeRemoval
                        ? customAllIndex
                        : customAllIndex - 1;
                });

                $outputs.val(JSON.stringify(node.outputs));
            },
            onMessageTypeChange: function (e) {
                const val = e.target.value;
                $customoutputs.messageValue.typedInput(
                    val === 'default' ? 'hide' : 'show'
                );
            },
            comparatorPropertyTypeChange: function (e) {
                const val = e.target.value;
                if (val === 'always') {
                    $customoutputs.comparatorPropertyValue.attr(
                        'disabled',
                        'disabled'
                    );
                    $customoutputs.comparatorType.attr('disabled', 'disabled');
                    $customoutputs.comparatorValue.attr('disabled', 'disabled');
                    $customoutputs.comparatorPropertyValue.val('');
                }
                if (val === 'previous_state' || val === 'current_state') {
                    $customoutputs.comparatorPropertyValue.attr(
                        'disabled',
                        'disabled'
                    );
                    $customoutputs.comparatorType.removeAttr('disabled');
                    $customoutputs.comparatorValue.removeAttr('disabled');
                    $customoutputs.comparatorPropertyValue.val('');
                }
                if (val === 'property') {
                    $customoutputs.comparatorPropertyValue.removeAttr(
                        'disabled'
                    );
                    $customoutputs.comparatorType.removeAttr('disabled');
                    $customoutputs.comparatorValue.removeAttr('disabled');
                }
            },
        };

        $customoutputs.list.editableList({
            addButton: false,
            height: 159,
            sortable: false,
            removable: true,
            removeItem: outputsHandler.onEditableListRemove,
            addItem: outputsHandler.onEditableListAdd,
        });

        // Constraint select menu change handlers
        $customoutputs.messageType.on(
            'change',
            outputsHandler.onMessageTypeChange
        );

        $customoutputs.messageValue.typedInput({
            default: 'json',
            types: ['str', 'num', 'bool', 'json'],
            typeField: '#output-message-value-type',
        });
        $customoutputs.messageType.trigger('change');

        $customoutputs.comparatorPropertyType.on(
            'change',
            outputsHandler.comparatorPropertyTypeChange
        );

        $customoutputs.addBtn.on('click', outputsHandler.onAddButtonClicked);

        // **************************
        // * General Init
        // **************************
        $accordionContraint.accordion({
            active: true,
            collapsible: true,
            heightStyle: 'content',
        });
        $accordionOutput.accordion({
            active: false,
            collapsible: true,
            heightStyle: 'content',
        });

        $entityid.val(node.entityid);

        // Add previous constraints/outputs to editable lists
        node.constraints.forEach((c) =>
            $constraints.list.editableList('addItem', c)
        );
        node.customoutputs.forEach((o) =>
            $customoutputs.list.editableList('addItem', o)
        );
        exposeNode.init(node);
    },
    oneditsave: function () {
        const $constraintsList = $('#constraint-list');
        const $outputList = $('#output-list');
        const $entityid = $('#node-input-entityid');

        this.entityid = $entityid.val();

        // Compile Constraints
        const nodeConstraints = [];
        const listConstraints = $constraintsList.editableList('items');
        listConstraints.each(function (i) {
            nodeConstraints.push($(this).data('data'));
        });
        this.constraints = nodeConstraints;

        // Compile Outputs
        const nodeOutputs = [];
        const listOutputs = $outputList.editableList('items');
        listOutputs.each(function (i) {
            nodeOutputs.push($(this).data('data'));
        });
        this.customoutputs = nodeOutputs;

        this.outputs = this.customoutputs.length + 2;
        this.haConfig = exposeNode.getValues();
    },
});
