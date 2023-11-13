import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import ha, { NodeCategory } from '../../editor/ha';

declare const RED: EditorRED;

export interface DeviceConfigEditorNodeProperties extends EditorNodeProperties {
    version: number;
    hwVersion: string;
    manufacturer: string;
    model: string;
    swVersion: string;
}

const DeviceConfigEditor: EditorNodeDef<DeviceConfigEditorNodeProperties> = {
    category: NodeCategory.Config,
    defaults: {
        version: { value: RED.settings.get('haDeviceConfigVersion', 0) },
        name: { value: '', required: false },
        hwVersion: { value: '', required: false },
        manufacturer: { value: 'Node-RED', required: false },
        model: { value: '', required: false },
        swVersion: { value: '', required: false },
    },
    icon: 'font-awesome/fa-device',
    label: function (): string {
        return this.name || 'Device Config';
    },
    oneditprepare: function () {
        ha.setup(this);
    },
};

export default DeviceConfigEditor;
