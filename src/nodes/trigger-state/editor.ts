import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import EntitySelector from '../../editor/components/EntitySelector';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { i18n } from '../../editor/i18n';
import { HassExposedConfig } from '../../editor/types';

declare const RED: EditorRED;

interface Constraint {
    targetType: string;
    targetValue: string;
    propertyType: string;
    propertyValue: string;
    comparatorType: string;
    comparatorValueDatatype: string;
    comparatorValue: string;
}

interface CustomOutput {
    messageType: string;
    messageValue: string;
    messageValueType: string;
    comparatorPropertyType: string;
    comparatorPropertyValue: string;
    comparatorType: string;
    comparatorValue: string;
    comparatorValueDataType: string;
}

interface TriggerStateEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    exposeToHomeAssistant: boolean;
    haConfig: HassExposedConfig[];
    entityid: string | string[];
    entityidfiltertype: string;
    debugenabled: boolean;
    constraints: Constraint[];
    customoutputs: CustomOutput[];
    outputinitially: boolean;
    state_type: 'str' | 'num' | 'habool';
    enableInput: boolean;
}

const TriggerStateEditor: EditorNodeDef<TriggerStateEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 0,
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
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('triggerStateVersion', 0) },
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
        // @ts-ignore - DefinitelyTyped is wrong inputs can be changed
        inputs: { value: 0 },
        outputs: { value: 2 },
        customoutputs: { value: [] },
        outputinitially: { value: false },
        state_type: { value: 'str' },
        enableInput: { value: false },
    },
    oneditprepare: function () {
        ha.setup(this);
        const $constraintList = $('#constraint-list');
        const $outputList = $('#output-list');

        haServer.init(this, '#node-input-server', (serverId) => {
            entitySelector.serverChanged(serverId);
        });
        const entitySelector = new EntitySelector({
            filterTypeSelector: '#node-input-entityidfiltertype',
            entityId: this.entityid,
            serverId: haServer.getSelectedServerId(),
        });
        $('#dialog-form').data('entitySelector', entitySelector);

        let availableEntities: string[] = [];
        let availableProperties: string[] = [];
        let availablePropertiesPrefixed: string[] = [];
        haServer.autocomplete('entities', (entities: string[]) => {
            availableEntities = entities;
        });
        haServer.autocomplete('properties', (properties: string[]) => {
            availableProperties = properties;
            // prefix properties with new_state and old_state
            availablePropertiesPrefixed = [
                ...properties.map((e) => `new_state.${e}`),
                ...properties.map((e) => `old_state.${e}`),
            ].sort();
        });
        exposeNode.init(this);

        const $customOutputs = $('#node-input-outputs').val('{"0": 0, "1": 1}');
        const getOutputs = () => {
            return JSON.parse($customOutputs.val() as string);
        };
        const saveOutputs = (data: any) => {
            $customOutputs.val(JSON.stringify(data));
        };
        const updateOutputs = (outputs: Record<string, number>) => {
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

        const constraintListAddItem = (
            container: JQuery<HTMLElement>,
            index: number,
            data: Constraint
        ) => {
            $('#constraint-template').children().clone().appendTo(container);

            container.find('.target-value').autocomplete({
                source: (req: any, cb: (entities: string[]) => void) => {
                    const term = req.term.toLowerCase();
                    const filiteredEntities = availableEntities.filter(
                        (entity) => entity.includes(term)
                    );
                    cb(filiteredEntities);
                },
                minLength: 0,
            });
            container.find('.property-value').autocomplete({
                source: (req: any, cb: (entities: string[]) => void) => {
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

            const $comparatorValue = container.find('.comparator-value');
            $comparatorValue.typedInput('type', data.comparatorValueDatatype);
            $comparatorValue.typedInput('value', data.comparatorValue);
        };

        $constraintList.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append(i18n('trigger-state.label.conditions')),
            addItem: constraintListAddItem,
        });

        $constraintList.editableList(
            'addItems',
            this.constraints.length ? this.constraints : []
        );

        $outputList.on('change', '.message-type', function (e) {
            const val = e.target.value;
            $(this)
                .parent()
                .find('.message-value')
                .typedInput((val === 'default' ? 'hide' : 'show') as any);
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
            addItem: function (container, index, opt: any) {
                if (!opt.hasOwnProperty('condition')) {
                    opt.condition = {};
                }
                const data = opt.condition;
                if (!opt.hasOwnProperty('index')) {
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
                    source: (req: any, cb: (properties: string[]) => void) => {
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
                    opt.hasOwnProperty('index') ? opt.index : opt._index
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
                const $messageValue = container.find('.message-value');
                $messageValue.typedInput('value', data.messageValue);
                $messageValue.typedInput('type', data.messageValueType);
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
                const $comparatorValue = container.find('.comparator-value');
                $comparatorValue.typedInput('value', data.comparatorValue);
                $comparatorValue.typedInput(
                    'type',
                    data.comparatorValueDataType
                );
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
        const constraints: Constraint[] = [];
        const outputs: CustomOutput[] = [];

        constraintsItems.each(function () {
            const $this = $(this);
            const $comparatorValue = $this.find('.comparator-value');
            const constraint: Constraint = {
                targetType: $this.find('.target-type').val() as string,
                targetValue: $this.find('.target-value').val() as string,
                propertyType: $this.find('.property-type').val() as string,
                propertyValue: $this.find('.property-value').val() as string,
                comparatorType: $this.find('.comparator-type').val() as string,
                comparatorValueDatatype: $comparatorValue.typedInput('type'),
                comparatorValue: $comparatorValue.typedInput('value'),
            };

            if (constraint.propertyType === 'current_state') {
                constraint.propertyValue = 'new_state.state';
            } else if (constraint.propertyType === 'previous_state') {
                constraint.propertyValue = 'old_state.state';
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
            const output: CustomOutput = {
                messageType: $this.find('.message-type').val() as string,
                messageValue: $message.typedInput('value'),
                messageValueType: $message.typedInput('type'),
                comparatorPropertyType: $this
                    .find('.comparator-property-type')
                    .val() as string,
                comparatorPropertyValue: $this
                    .find('.comparator-property-value')
                    .val() as string,
                comparatorType: $this.find('.comparator-type').val() as string,
                comparatorValue: $comparatorValue.typedInput('value'),
                comparatorValueDataType: $comparatorValue.typedInput('type'),
            };

            if (output.comparatorPropertyType === 'current_state') {
                output.comparatorPropertyValue = 'new_state.state';
            } else if (output.comparatorPropertyType === 'previous_state') {
                output.comparatorPropertyValue = 'old_state.state';
            }

            if (
                output.comparatorType === 'includes' ||
                output.comparatorType === 'does_not_include'
            ) {
                output.comparatorValueDataType = 'list';
            }

            outputs.push(output);
        });

        $('#node-input-inputs').val(
            $('#node-input-enableInput').is(':checked') ? 1 : 0
        );

        this.constraints = constraints;
        this.customoutputs = outputs;
        this.haConfig = exposeNode.getValues();
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        this.entityid = entitySelector.entityId;
        entitySelector.destroy();
    },
    oneditcancel: function () {
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        entitySelector.destroy();
    },
};

export default TriggerStateEditor;
