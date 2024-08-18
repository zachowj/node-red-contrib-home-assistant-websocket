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
    value: string | number | string[];
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

export interface HassNodeProperties extends EditorNodeProperties {
    version: number;
    debugenabled?: boolean;
    server?: string;
    entityConfigNode?: string;
    exposeAsEntityConfig?: string;
    outputs?: number | undefined;

    // TODO: remove after controllers are converted to TypeScript
    exposeToHomeAssistant?: boolean;
    haConfig?: HassExposedConfig[];
}
