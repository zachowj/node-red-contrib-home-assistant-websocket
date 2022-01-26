import {
    EditorNodeProperties,
    EditorWidgetEditableListOptions as WidgetEditableListOptions,
    EditorWidgetTypedInputType,
    EditorWidgetTypedInputTypeDefinition,
} from 'node-red';

export type OutputProperty = {
    property?: string;
    propertyType?: string;
    value?: string;
    valueType?: string;
};

export interface HassExposedConfig {
    property: string;
    value: string;
}

export type HATypedInputTypeOptions = Array<
    EditorWidgetTypedInputType | EditorWidgetTypedInputTypeDefinition
>;

export type StateType = 'str' | 'num' | 'habool';

interface EditorWidgetEditableListButton {
    label: string;
    icon: string;
    click: () => void;
}

export interface EditorWidgetEditableListOptions<T>
    extends WidgetEditableListOptions<T> {
    buttons: EditorWidgetEditableListButton[];
}

export interface HassNodeProperties
    extends Omit<EditorNodeProperties, 'outputs' | 'inputs'> {
    version: number;
    debugenabled?: boolean;
    server?: string;
    entityConfigNode?: string;
    exposeToHomeAssistant?: boolean;
    outputs?: number | undefined;
    haConfig?: HassExposedConfig[];
}

export interface HassTargetDomains {
    areas: { [area_id: string]: string[] };
    devices: { [id: string]: string[] };
}
