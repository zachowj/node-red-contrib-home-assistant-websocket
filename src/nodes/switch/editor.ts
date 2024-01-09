import { EditorNodeDef, EditorRED } from 'node-red';

import { EntityType, NodeType } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import { HassNodeProperties, OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface SwitchEditorNodeProperties extends HassNodeProperties {
    enableInput: boolean;
    entityConfig: any;
    outputOnStateChange: boolean;
    outputProperties: OutputProperty[];
}

const SwitchEditor: EditorNodeDef<SwitchEditorNodeProperties> = {
    category: NodeCategory.HomeAssistantEntities,
    color: NodeColor.HaBlue,
    inputs: 0,
    outputs: 1,
    icon: 'font-awesome/fa-toggle-on',
    align: 'left',
    paletteLabel: 'switch',
    label: function () {
        return this.name || 'switch';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        version: { value: RED.settings.get('haSwitchVersion', 0) },
        debugenabled: { value: false },
        inputs: { value: 0 },
        outputs: { value: 2 },
        entityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === 'switch',
            required: true,
        },
        enableInput: { value: false },
        outputOnStateChange: { value: false },
        outputProperties: {
            value: [
                {
                    property: 'outputType',
                    propertyType: 'msg',
                    value: 'state change',
                    valueType: 'str',
                },
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        ha.setup(this);
        exposeNode.init(this);

        saveEntityType(EntityType.Switch);

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entityState'],
        });

        $('#node-input-outputOnStateChange').on('change', function () {
            $('#ha-custom-ouputs').toggle($(this).is(':checked'));
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
        $('#node-input-inputs').val(
            $('#node-input-enableInput').is(':checked') ? 1 : 0,
        );
    },
};

export default SwitchEditor;
