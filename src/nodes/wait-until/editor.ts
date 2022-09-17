import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import EntitySelector from '../../editor/components/EntitySelector';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HATypedInputTypeOptions } from '../../editor/types';

declare const RED: EditorRED;

interface WaitUntilEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    entityId: string | string[];
    entityIdFilterType: string;
    property: string;
    comparator: string;
    value: string;
    valueType: string;
    timeout: string;
    timeoutType: string;
    timeoutUnits: string;
    entityLocation: string;
    entityLocationType: string;
    checkCurrentState: boolean;
    blockInputOverrides: boolean;
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
        server: { value: '', type: 'server', required: true },
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
        entityLocation: { value: 'data' },
        entityLocationType: { value: 'none' },
        checkCurrentState: { value: true },
        blockInputOverrides: { value: true },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server', () => {
            entitySelector.serverChanged();
        });
        const entitySelector = new EntitySelector({
            filterTypeSelector: '#node-input-entityIdFilterType',
            entityId: this.entityId,
        });
        $('#dialog-form').data('entitySelector', entitySelector);

        let availableProperties = [];
        haServer.autocomplete('properties', (properties: string[]) => {
            availableProperties = properties;
            $('#node-input-property').autocomplete({
                source: availableProperties,
                minLength: 0,
            });
        });

        const entityType = { value: 'entity', label: 'entity.' };
        const defaultTypes: HATypedInputTypeOptions = [
            'str',
            'num',
            'bool',
            're',
            'jsonata',
            'msg',
            'flow',
            'global',
            entityType,
        ];
        $('#node-input-value').typedInput({
            default: 'str',
            types: defaultTypes,
            typeField: '#node-input-valueType',
        });

        $('#node-input-comparator').on('change', function () {
            let types = defaultTypes;
            const value = $(this).val() as string;
            $('#node-input-property').prop('disabled', value === 'jsonata');

            switch (value) {
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
                        entityType,
                    ];
                    break;
                case 'includes':
                case 'does_not_include':
                    types = ['str', 'jsonata', 'msg', 'flow', 'global'];
                    break;
                case 'jsonata':
                    types = ['jsonata'];
                    break;
            }
            $('#node-input-value').typedInput('types', types);
        });

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const node = this;
        $('#node-input-timeout')
            .typedInput({
                default: 'num',
                types: ['num', 'jsonata'],
                typeField: '#node-input-timeoutType',
            })
            .on('change', function (_, timeoutType) {
                if (timeoutType === true) return;

                node.outputs =
                    timeoutType === 'jsonata' ||
                    (timeoutType === 'num' && Number($(this).val()) > 0)
                        ? 2
                        : 1;
            });

        const NoneType = { value: 'none', label: 'None', hasValue: false };
        $('#node-input-entityLocation').typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-entityLocationType',
        });

        const $filterType = $('#node-input-entityIdFilterType');
        $filterType.on('change', function () {
            $('.exact-only').toggle($filterType.val() === 'exact');
        });
    },
    oneditsave: function () {
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        this.entityId = entitySelector.entityId;
        entitySelector.destroy();
    },
    oneditcancel: function () {
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        entitySelector.destroy();
    },
};
export default WaitUntilEditor;
