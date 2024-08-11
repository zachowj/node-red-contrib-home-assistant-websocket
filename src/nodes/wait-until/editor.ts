import { EditorNodeDef, EditorRED } from 'node-red';

import { IdSelectorType } from '../../common/const';
import {
    ComparatorType,
    EntityFilterType,
    NodeType,
    TypedInputTypes,
} from '../../const';
import IdSelector, {
    getSelectedIds,
} from '../../editor/components/idSelector/IdSelector';
import * as haOutputs from '../../editor/components/output-properties';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { i18n } from '../../editor/i18n';
import { insertSocialBar } from '../../editor/socialbar';
import {
    HassNodeProperties,
    HATypedInputTypeOptions,
    OutputProperty,
} from '../../editor/types';
import { EntitySelectorList } from '../events-state';

declare const RED: EditorRED;

interface WaitUntilEditorNodeProperties extends HassNodeProperties {
    entities: EntitySelectorList;
    property: string;
    comparator: string;
    value: string;
    valueType: string;
    timeout: string;
    timeoutType: string;
    timeoutUnits: string;
    checkCurrentState: boolean;
    blockInputOverrides: boolean;
    outputProperties: OutputProperty[];

    // deprecated
    entityId: undefined;
    entityIdFilterType: undefined;
    entityLocation: undefined;
    entityLocationType: undefined;
}

const WaitUntilEditor: EditorNodeDef<WaitUntilEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    outputLabels: ['', 'timed out'],
    icon: 'ha-wait-until.svg',
    paletteLabel: 'wait until',
    label: function () {
        return this.name || `wait until`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haWaitUntilVersion', 0) },
        outputs: { value: 1 },
        entities: {
            value: {
                [IdSelectorType.Entity]: [''],
                [IdSelectorType.Substring]: [],
                [IdSelectorType.Regex]: [],
            },
        },
        property: { value: '' },
        comparator: { value: ComparatorType.Is },
        value: { value: '' },
        valueType: { value: TypedInputTypes.String },
        timeout: { value: '0' },
        timeoutType: { value: TypedInputTypes.Number },
        timeoutUnits: { value: 'seconds' },
        checkCurrentState: { value: true },
        blockInputOverrides: { value: true },
        outputProperties: { value: [] },

        // deprecated but needed to import old versions
        entityId: { value: undefined },
        entityIdFilterType: { value: undefined },
        entityLocation: { value: undefined },
        entityLocationType: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server', () => {
            idSelector.refreshOptions();
        });

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

        let availableProperties: string[] = [];
        haServer.autocomplete('properties', (properties: string[]) => {
            availableProperties = properties;
            $('#node-input-property').autocomplete({
                source: availableProperties,
                minLength: 0,
            });
        });

        const entityType = { value: 'entity', label: 'entity.' };
        const defaultTypes: HATypedInputTypeOptions = [
            TypedInputTypes.String,
            TypedInputTypes.Number,
            TypedInputTypes.Boolean,
            TypedInputTypes.Regex,
            TypedInputTypes.JSONata,
            TypedInputTypes.Message,
            TypedInputTypes.Flow,
            TypedInputTypes.Global,
            entityType,
        ];
        $('#node-input-value').typedInput({
            default: TypedInputTypes.String,
            types: defaultTypes,
            typeField: '#node-input-valueType',
        });

        $('#node-input-comparator').on('change', function () {
            let types = defaultTypes;
            const value = $(this).val() as string;
            $('#node-input-property').prop(
                'disabled',
                value === TypedInputTypes.JSONata,
            );

            switch (value) {
                case ComparatorType.Is:
                case ComparatorType.IsNot:
                    break;
                case ComparatorType.IsLessThan:
                case ComparatorType.IsLessThanOrEqual:
                case ComparatorType.IsGreaterThan:
                case ComparatorType.IsGreaterThanOrEqual:
                    types = [
                        TypedInputTypes.Number,
                        TypedInputTypes.JSONata,
                        TypedInputTypes.Message,
                        TypedInputTypes.Flow,
                        TypedInputTypes.Global,
                        entityType,
                    ];
                    break;
                case ComparatorType.Includes:
                case ComparatorType.DoesNotInclude:
                    types = [
                        TypedInputTypes.String,
                        TypedInputTypes.JSONata,
                        TypedInputTypes.Message,
                        TypedInputTypes.Flow,
                        TypedInputTypes.Global,
                    ];
                    break;
                case ComparatorType.JSONata:
                    types = [TypedInputTypes.JSONata];
                    break;
            }
            $('#node-input-value').typedInput('types', types);
        });

        $('#node-input-timeout').typedInput({
            default: TypedInputTypes.Number,
            types: [TypedInputTypes.Number, TypedInputTypes.JSONata],
            typeField: '#node-input-timeoutType',
        });

        const $filterType = $('#node-input-entityIdFilterType');
        $filterType.on('change', function () {
            $('.exact-only').toggle(
                $filterType.val() === EntityFilterType.Exact,
            );
        });
        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entity'],
        });

        insertSocialBar('wait-until');
    },
    oneditsave: function () {
        // entities
        const entities = getSelectedIds('#entity-list');
        this.entities = {
            [IdSelectorType.Entity]: entities[IdSelectorType.Entity],
            [IdSelectorType.Substring]: entities[IdSelectorType.Substring],
            [IdSelectorType.Regex]: entities[IdSelectorType.Regex],
        };

        // timeout
        const timeoutType = $('#node-input-timeoutType').val() as string;
        const timeout = $('#node-input-timeout').val() as string;
        this.outputs =
            timeoutType === TypedInputTypes.JSONata ||
            (timeoutType === TypedInputTypes.Number && Number(timeout) > 0)
                ? 2
                : 1;

        // output properties
        this.outputProperties = haOutputs.getOutputs();
    },
};
export default WaitUntilEditor;
