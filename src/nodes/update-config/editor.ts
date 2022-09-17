import { EditorNodeDef, EditorRED } from 'node-red';

import * as haOutputs from '../../editor/components/output-properties';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HassNodeProperties, OutputProperty } from '../../editor/types';

declare const RED: EditorRED;

interface UpdateConfigEditorNodeProperties extends HassNodeProperties {
    entityConfig: any;
    outputProperties: OutputProperty[];
}

const UpdateConfigEditor: EditorNodeDef<UpdateConfigEditorNodeProperties> = {
    category: NodeCategory.HomeAssistantEntities,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-asterisk',
    align: 'right',
    paletteLabel: 'update config',
    label: function () {
        return this.name || 'update config';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        entityConfig: {
            value: '',
            type: 'ha-entity-config',
            required: false,
        },
        version: { value: RED.settings.get('haSensorVersion', 0) },
        outputProperties: {
            value: [],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');

        if (this.entityConfig === '_ADD_') {
            $('#node-input-entityConfig').val('_ADD_');
        }

        haOutputs.createOutputs(this.outputProperties);
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default UpdateConfigEditor;
