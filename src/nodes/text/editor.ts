import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { EntityType, NodeType } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import { OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface TextEditorNodeProperties extends EditorNodeProperties {
    version: number;
    debugenabled: boolean;
    entityConfig: any;
    outputProperties: OutputProperty[];
}

const TextEditor: EditorNodeDef<TextEditorNodeProperties> = {
    category: NodeCategory.HomeAssistantEntities,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-font',
    align: 'right',
    paletteLabel: 'text',
    label: function () {
        return this.name || 'text';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        version: { value: RED.settings.get('haTextVersion', 0) },
        debugenabled: { value: false },
        outputs: { value: 1 },
        entityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === 'text',
            required: true,
        },
        state: { value: 'payload' },
        stateType: { value: 'msg' },
        outputProperties: {
            value: [
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

        saveEntityType(EntityType.Text);

        $('#node-input-state').typedInput({
            types: ['msg', 'flow', 'global', 'jsonata', 'num'],
            typeField: '#node-input-stateType',
            // @ts-expect-error - DefinitelyTyped is wrong typedInput can take a object as a parameter
            type: this.stateType,
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entityState'],
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default TextEditor;
