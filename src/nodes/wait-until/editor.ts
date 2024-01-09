import { EditorNodeDef, EditorRED } from 'node-red';

import {
    ComparatorType,
    EntityFilterType,
    NodeType,
    TypedInputTypes,
} from '../../const';
import EntitySelector from '../../editor/components/EntitySelector';
import * as haOutputs from '../../editor/components/output-properties';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import {
    HassNodeProperties,
    HATypedInputTypeOptions,
    OutputProperty,
} from '../../editor/types';

declare const RED: EditorRED;

interface WaitUntilEditorNodeProperties extends HassNodeProperties {
    entityId: string | string[];
    entityIdFilterType: string;
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
    entityLocation: string;
    entityLocationType: string;
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
        entityId: { value: '' },
        entityIdFilterType: { value: 'exact' },
        property: { value: '' },
        comparator: { value: 'is' },
        value: { value: '' },
        valueType: { value: 'str' },
        timeout: { value: '0' },
        timeoutType: { value: 'num' },
        timeoutUnits: { value: 'seconds' },
        checkCurrentState: { value: true },
        blockInputOverrides: { value: true },
        outputProperties: { value: [] },
        // deprecated but needed to import old versions
        entityLocation: { value: 'data' },
        entityLocationType: { value: 'none' },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server', (serverId) => {
            entitySelector.serverChanged(serverId);
        });
        const entitySelector = new EntitySelector({
            filterTypeSelector: '#node-input-entityIdFilterType',
            entityId: this.entityId,
            serverId: haServer.getSelectedServerId(),
        });
        $('#dialog-form').data('entitySelector', entitySelector);

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
            $('#node-input-property').prop('disabled', value === 'jsonata');

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

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const node = this;
        $('#node-input-timeout')
            .typedInput({
                default: TypedInputTypes.Number,
                types: [TypedInputTypes.Number, TypedInputTypes.JSONata],
                typeField: '#node-input-timeoutType',
            })
            .on('change', function (_, timeoutType) {
                if (timeoutType === true) return;

                node.outputs =
                    timeoutType === TypedInputTypes.JSONata ||
                    (timeoutType === TypedInputTypes.Number &&
                        Number($(this).val()) > 0)
                        ? 2
                        : 1;
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
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
        const entitySelector = $('#dialog-form').data(
            'entitySelector',
        ) as EntitySelector;
        this.entityId = entitySelector.entityId;
        entitySelector.destroy();
    },
    oneditcancel: function () {
        const entitySelector = $('#dialog-form').data(
            'entitySelector',
        ) as EntitySelector;
        entitySelector.destroy();
    },
};
export default WaitUntilEditor;
