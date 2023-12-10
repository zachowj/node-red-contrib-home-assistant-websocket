import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType, TypedInputTypes } from '../../const';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';

declare const RED: EditorRED;

interface FireEventEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    event: string;
    data: string;
    dataType: TypedInputTypes;
}

const FireEventEditor: EditorNodeDef<FireEventEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-fire-event.svg',
    align: 'right',
    paletteLabel: 'fire event',
    label: function () {
        return this.name || `Event: ${this.event}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haFireEventVersion', 0) },
        event: { value: '' },
        data: {
            value: '',
            // @ts-expect-error - DefinitelyTyped is missing this property
            validate: RED.validators.typedInput({
                type: 'dateType',
                allowBlank: true,
            }),
        },
        dataType: { value: TypedInputTypes.JSONata },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');

        $('#node-input-data').typedInput({
            types: [TypedInputTypes.JSON, TypedInputTypes.JSONata],
            typeField: '#node-input-dataType',
        });
    },
};

export default FireEventEditor;
