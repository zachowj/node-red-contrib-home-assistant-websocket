import { EditorNodeDef, EditorRED } from 'node-red';

import { IdSelectorType } from '../../common/const';
import { TransformType } from '../../common/TransformState';
import {
    ComparatorType,
    EntityType,
    NodeType,
    TypedInputTypes,
} from '../../const';
import IdSelector, {
    getSelectedIds,
} from '../../editor/components/idSelector/IdSelector';
import {
    DeprecatedSettingType,
    renderDeprecatedSettings,
} from '../../editor/deprecated_settings';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { i18n } from '../../editor/i18n';
import { insertSocialBar } from '../../editor/socialbar';
import { HassNodeProperties } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';
import { EntitySelectorList } from '../events-state';
import {
    ComparatorPropertyType,
    Constraint,
    CustomOutput,
    MessageType,
    PropertyType,
    TargetType,
} from './const';

declare const RED: EditorRED;

interface TriggerStateEditorNodeProperties extends HassNodeProperties {
    entities: EntitySelectorList;
    constraints: Constraint[];
    customOutputs: CustomOutput[];
    outputInitially: boolean;
    stateType: TransformType;
    enableInput: boolean;

    // deprecated but still needed for migration
    entityId: undefined;
    entityIdType: undefined;
    exposeToHomeAssistant: undefined;
    haConfig: undefined;
    entityid: undefined;
    entityidfiltertype: undefined;
    debugenabled: undefined;
    customoutputs: undefined;
    outputinitially: undefined;
    state_type: undefined;
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
        const co = this.customOutputs[index - NUM_DEFAULT_OUTPUTS];
        let label;
        if (co.comparatorPropertyType === ComparatorPropertyType.Always) {
            label = 'always sent';
        } else {
            label = `${co.comparatorPropertyType.replace(
                '_',
                ' ',
            )} ${co.comparatorType.replace('_', '')} ${co.comparatorValue}`;
        }
        return label;
    },
    icon: 'font-awesome/fa-map-signs',
    paletteLabel: 'trigger: state',
    label: function () {
        let label: string[] = [];
        if (this.entities) {
            Object.entries(this.entities).forEach(([, ids]) => {
                if (Array.isArray(ids) && ids?.length) {
                    label = [...label, ...ids];
                }
            });
        }

        return this.name || `trigger-state: ${label}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('triggerStateVersion', 0) },
        inputs: { value: 0 },
        outputs: { value: 2 },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        entities: {
            value: {
                [IdSelectorType.Entity]: [''],
                [IdSelectorType.Substring]: [],
                [IdSelectorType.Regex]: [],
            },
            // TODO: After v1.0 uncomment validation because now it will throw errors for nodes that have a version prior to 6
            // validate: (value) => {
            //     if (!value) {
            //         return false;
            //     }

            //     Object.entries(value).forEach(([_, ids]) => {
            //         if (Array.isArray(ids)) {
            //             if (ids.some((id) => id.length)) {
            //                 return true;
            //             }
            //         }
            //     });

            //     return false;
            // },
        },
        debugEnabled: { value: false },
        constraints: {
            value: [
                {
                    targetType: TargetType.ThisEntity,
                    targetValue: '',
                    propertyType: PropertyType.CurrentState,
                    propertyValue: 'new_state.state',
                    comparatorType: ComparatorType.Is,
                    comparatorValueDatatype: TypedInputTypes.String,
                    comparatorValue: '',
                },
            ],
        },
        customOutputs: { value: [] },
        outputInitially: { value: false },
        stateType: { value: TransformType.String },
        enableInput: { value: false },

        // deprecated but still needed for migration
        entityId: { value: undefined },
        entityIdType: { value: undefined },
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
        entityid: { value: undefined },
        entityidfiltertype: { value: undefined },
        debugenabled: { value: undefined },
        customoutputs: { value: undefined },
        outputinitially: { value: undefined },
        state_type: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        const $constraintList = $('#constraint-list');
        const $outputList = $('#output-list');

        haServer.init(this, '#node-input-server', () => {
            idSelector.refreshOptions();
        });
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        const idSelector = new IdSelector({
            element: '#entity-list',
            types: [
                IdSelectorType.Entity,
                IdSelectorType.Substring,
                IdSelectorType.Regex,
            ],
            headerText: i18n('server-state-changed.label.entities'),
        });
        Object.entries(this.entities).forEach(([type, ids]) => {
            ids?.forEach((id) => {
                idSelector.addId(type as IdSelectorType, id);
            });
        });

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
            const thisEntitySelected = $this.val() === TargetType.ThisEntity;
            const $parent = $this.parent().parent();
            const $targetValue = $this.next();
            const $propertyType = $parent.find('.property-type');

            if (thisEntitySelected) {
                $targetValue.attr('disabled', 'disabled').val('');
            } else {
                $targetValue.removeAttr('disabled');
            }
            $propertyType
                .find(`option[value=${PropertyType.PreviousState}]`)
                .toggle(thisEntitySelected);
            if ($propertyType.val() === PropertyType.PreviousState) {
                $propertyType.val(PropertyType.CurrentState).trigger('change');
            }
        });
        $constraintList.on('change', '.property-type', function (e) {
            const val = e.target.value;
            if (
                [
                    PropertyType.CurrentState,
                    PropertyType.PreviousState,
                ].includes(val)
            ) {
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
                '.comparator-property-value',
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
            data: Constraint,
        ) => {
            $('#constraint-template').children().clone().appendTo(container);

            container.find('.target-value').autocomplete({
                source: (req: any, cb: (entities: string[]) => void) => {
                    const term = req.term.toLowerCase();
                    const filiteredEntities = availableEntities.filter(
                        (entity) => entity.includes(term),
                    );
                    cb(filiteredEntities);
                },
                minLength: 0,
            });
            container.find('.property-value').autocomplete({
                source: (req: any, cb: (entities: string[]) => void) => {
                    const term = req.term.toLowerCase();
                    const props =
                        container.find('.target-type').val() ===
                        TargetType.ThisEntity
                            ? availablePropertiesPrefixed
                            : availableProperties;
                    const filiteredProps = props.filter((prop) =>
                        prop.includes(term),
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
            if (data.propertyType === PropertyType.Property) {
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
            this.constraints.length ? this.constraints : [],
        );

        $outputList.on('change', '.message-type', function (e) {
            const val = e.target.value as MessageType;
            $(this)
                .parent()
                .find('.message-value')
                .typedInput((val === 'default' ? 'hide' : 'show') as any);
        });
        $outputList.on('change', '.comparator-property-type', function (e) {
            const val = e.target.value as ComparatorPropertyType;
            const $container = $(this).parent().parent();
            const $comparatorPropertyValue = $container.find(
                '.comparator-property-value',
            );
            const $comparatorType = $container.find('.comparator-type');
            const $comparatorValue = $container.find('.comparator-value');

            switch (val) {
                case ComparatorPropertyType.Always:
                    $comparatorPropertyValue.attr('disabled', 'disabled');
                    $comparatorType.attr('disabled', 'disabled');
                    $comparatorValue.typedInput('hide');
                    $comparatorPropertyValue.val('');
                    break;
                case ComparatorPropertyType.PreviousState:
                case ComparatorPropertyType.CurrentState:
                    $comparatorPropertyValue.attr('disabled', 'disabled');
                    $comparatorType.removeAttr('disabled');
                    $comparatorValue.typedInput('show');
                    $comparatorPropertyValue.val('');
                    break;
                case ComparatorPropertyType.Property:
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
                        (0x99999 - 0x10000) * Math.random(),
                    ).toString();
                }

                $('#output-template').children().clone().appendTo(container);

                container.css({
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                });
                container.find('.message-value').typedInput({
                    default: TypedInputTypes.JSON,
                    types: [
                        TypedInputTypes.String,
                        TypedInputTypes.Number,
                        TypedInputTypes.Boolean,
                        TypedInputTypes.JSON,
                        TypedInputTypes.JSONata,
                    ],
                });
                container.find('.comparator-property-value').autocomplete({
                    source: (req: any, cb: (properties: string[]) => void) => {
                        const term = req.term.toLowerCase();
                        const props = availablePropertiesPrefixed;
                        const filiteredProps = props.filter((prop) =>
                            prop.includes(term),
                        );

                        cb(filiteredProps);
                    },
                    minLength: 0,
                });
                container.find('.comparator-value').typedInput({
                    default: TypedInputTypes.String,
                    types: [
                        TypedInputTypes.String,
                        TypedInputTypes.Number,
                        TypedInputTypes.Boolean,
                        TypedInputTypes.Regex,
                        TypedInputTypes.JSONata,
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
                    data.comparatorValueDataType,
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

        this.customOutputs.forEach((output, index) =>
            $outputList.editableList('addItem', {
                condition: output,
                index: index + 2,
            }),
        );

        insertSocialBar('trigger-state');
        renderDeprecatedSettings(this, [DeprecatedSettingType.StateType]);
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
                targetType: $this.find('.target-type').val() as TargetType,
                targetValue: $this.find('.target-value').val() as string,
                propertyType: $this
                    .find('.property-type')
                    .val() as PropertyType,
                propertyValue: $this.find('.property-value').val() as string,
                comparatorType: $this
                    .find('.comparator-type')
                    .val() as ComparatorType,
                comparatorValueDatatype: $comparatorValue.typedInput(
                    'type',
                ) as TypedInputTypes,
                comparatorValue: $comparatorValue.typedInput('value'),
            };

            if (constraint.propertyType === PropertyType.CurrentState) {
                constraint.propertyValue = 'new_state.state';
            } else if (constraint.propertyType === PropertyType.PreviousState) {
                constraint.propertyValue = 'old_state.state';
            }

            constraints.push(constraint);
        });
        // Compile Outputs
        outputItems.each(function () {
            const $this = $(this);
            const $message = $this.find('.message-value');
            const $comparatorValue = $this.find('.comparator-value');
            const output: CustomOutput = {
                messageType: $this.find('.message-type').val() as MessageType,
                messageValue: $message.typedInput('value'),
                messageValueType: $message.typedInput(
                    'type',
                ) as TypedInputTypes,
                comparatorPropertyType: $this
                    .find('.comparator-property-type')
                    .val() as ComparatorPropertyType,
                comparatorPropertyValue: $this
                    .find('.comparator-property-value')
                    .val() as string,
                comparatorType: $this
                    .find('.comparator-type')
                    .val() as ComparatorType,
                comparatorValue: $comparatorValue.typedInput('value'),
                comparatorValueDataType: $comparatorValue.typedInput(
                    'type',
                ) as TypedInputTypes,
            };

            if (
                output.comparatorPropertyType ===
                ComparatorPropertyType.CurrentState
            ) {
                output.comparatorPropertyValue = 'new_state.state';
            } else if (
                output.comparatorPropertyType ===
                ComparatorPropertyType.PreviousState
            ) {
                output.comparatorPropertyValue = 'old_state.state';
            }

            outputs.push(output);
        });

        $('#node-input-inputs').val(
            $('#node-input-enableInput').is(':checked') ? 1 : 0,
        );

        this.constraints = constraints;
        this.customOutputs = outputs;

        const entities = getSelectedIds('#entity-list');
        this.entities = {
            [IdSelectorType.Entity]: entities[IdSelectorType.Entity],
            [IdSelectorType.Substring]: entities[IdSelectorType.Substring],
            [IdSelectorType.Regex]: entities[IdSelectorType.Regex],
        };
    },
};

export default TriggerStateEditor;
