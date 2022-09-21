import { EditorNodeDef, EditorRED, EditorWidgetTypedInputType } from 'node-red';

import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import { HassExposedConfig, HassNodeProperties } from '../../editor/types';

declare const RED: EditorRED;

interface EntityAttribute {
    property: string;
    value: string;
    valueType: string;
}

type WidgetTypedInputType = EditorWidgetTypedInputType | 'none';

export interface EntityEditorNodeProperties extends HassNodeProperties {
    entityType: string;
    config: HassExposedConfig[];

    // sensor binary_sensor
    state: string;
    stateType: WidgetTypedInputType;
    attributes: EntityAttribute[];
    resend: boolean;
    outputLocation: string;
    outputLocationType: WidgetTypedInputType;
    inputOverride: string;
    // switch
    outputOnStateChange: null;
    outputPayload: null;
    outputPayloadType: null;
}

const EntityEditor: EditorNodeDef<EntityEditorNodeProperties> = {
    category: NodeCategory.HomeAssistantDeprecated,
    color: NodeColor.Deprecated,
    inputs: 1,
    outputs: 1,
    // @ts-ignore - DefinitelyTyped is wrong icon can be a function
    icon: function (this: NodeInstance<EntityEditorNodeProperties>): string {
        return this?.entityType === 'switch'
            ? 'ha-entity-switch.svg'
            : 'font-awesome/fa-genderless';
    },
    align: 'right',
    paletteLabel: 'entity',
    label: function () {
        return this.name || `type: ${this.entityType}`;
    },
    labelStyle: function () {
        return this.name ? 'node_label_italic' : '';
    },
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('haEntityVersion', 0) },
        debugenabled: { value: false },
        outputs: { value: 1 },
        entityType: { value: 'sensor' },
        config: {
            value: [
                { property: 'name', value: '' },
                { property: 'device_class', value: '' },
                { property: 'icon', value: '' },
                { property: 'unit_of_measurement', value: '' },
                { property: 'state_class', value: '' },
                { property: 'last_reset', value: '' },
            ],
        },
        // sensor binary_sensor
        state: { value: 'payload' },
        stateType: { value: 'msg' },
        attributes: { value: [] },
        resend: { value: true },
        outputLocation: { value: 'payload' },
        outputLocationType: { value: 'none' },
        inputOverride: { value: 'allow' },
        // switch
        outputOnStateChange: { value: null },
        outputPayload: { value: null },
        outputPayloadType: { value: null },
    },
    oneditprepare: function () {
        ha.setup(this);
        if (this.server) {
            RED.tray.close();
        }
    },
};

export default EntityEditor;
