import { EditorNodeDef, EditorRED } from 'node-red';

import {
    EntityType,
    NodeType,
    TypedInputTypes,
    ValueIntegrationMode,
} from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import { insertSocialBar } from '../../editor/socialbar';
import { HassNodeProperties, OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface SelectEditorNodeProperties extends HassNodeProperties {
    entityConfig: any;
    mode: ValueIntegrationMode;
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

const SelectEditor: EditorNodeDef<SelectEditorNodeProperties> = {
    category: NodeCategory.HomeAssistantEntities,
    color: NodeColor.HaBlue,
    inputs: 0,
    outputs: 1,
    icon: 'font-awesome/fa-list',
    align: 'left',
    paletteLabel: 'select',
    label: function () {
        return this.name || 'select';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        version: { value: RED.settings.get('haTextVersion', 0) },
        debugenabled: { value: false },
        inputs: { value: 0 },
        outputs: { value: 1 },
        entityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Select,
            required: true,
        },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        mode: { value: ValueIntegrationMode.Listen },
        value: { value: 'payload' },
        valueType: { value: TypedInputTypes.Message },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: TypedInputTypes.Value,
                },
                {
                    property: 'previousValue',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: TypedInputTypes.PreviousValue,
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        ha.setup(this);
        exposeNode.init(this);

        saveEntityType(EntityType.Select);
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        const $valueRow = $('#node-input-value').parent();
        $('#node-input-mode').on('change', function (this: HTMLSelectElement) {
            $valueRow.toggle(this.value === ValueIntegrationMode.Set);
            $('#node-input-inputs').val(
                this.value === ValueIntegrationMode.Listen ? 0 : 1,
            );
        });

        $('#node-input-value').typedInput({
            types: [
                TypedInputTypes.Message,
                TypedInputTypes.Flow,
                TypedInputTypes.Global,
                TypedInputTypes.JSONata,
                TypedInputTypes.String,
            ],
            typeField: '#node-input-valueType',
            // @ts-expect-error - DefinitelyTyped is wrong typedInput can take a object as a parameter
            type: this.valueType,
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: [TypedInputTypes.Value, TypedInputTypes.PreviousValue],
        });

        insertSocialBar('select');
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default SelectEditor;
