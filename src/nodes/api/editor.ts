import { EditorNodeDef, EditorNodeInstance, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HassNodeProperties, OutputProperty } from '../../editor/types';

declare const RED: EditorRED;

interface ApiEditorNodeProperties extends HassNodeProperties {
    server: any;
    version: number;
    debugenabled: boolean;
    protocol: string;
    method: string;
    path: string;
    data: string;
    dataType: string;
    responseType: string;
    outputProperties: OutputProperty[];
    location?: string;
    locationType?: string;
}

const ApiEditor: EditorNodeDef<ApiEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-paper-plane-o',
    paletteLabel: 'API',
    label: function () {
        return this.name || 'API';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haApiVersion', 0) },
        debugenabled: { value: false },
        protocol: { value: 'websocket' },
        method: { value: 'get' },
        path: { value: '' },
        data: {
            value: '',
            // @ts-expect-error - DefinitelyTyped is missing this property
            validate: RED.validators.typedInput({
                type: 'dateType',
                allowBlank: true,
            }),
        },
        dataType: { value: 'jsonata' },
        responseType: { value: 'json' },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'results',
                },
            ],
            validate: haOutputs.validate,
        },
        // deprecated but still needed for imports of old flows
        location: { value: undefined },
        locationType: { value: undefined },
    },
    oneditprepare: function (
        this: EditorNodeInstance<ApiEditorNodeProperties>,
    ) {
        ha.setup(this);
        haServer.init(this, '#node-input-server');

        $('#node-input-data').typedInput({
            types: ['jsonata', 'json'],
            typeField: '#node-input-dataType',
        });

        $('#node-input-protocol')
            .on('change', function () {
                const isHttp = $(this).val() === 'http';
                $('.http').toggle(isHttp);
                $('#node-input-method').trigger('change');
            })
            .trigger('change');

        $('#node-input-method').on('change', function () {
            const label =
                $('#node-input-protocol').val() === 'http' &&
                $('#node-input-method').val() === 'get'
                    ? 'Params'
                    : 'Data';
            $('#data-label').text(label);
        });

        $('#node-input-location').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                { value: 'none', label: 'None', hasValue: false },
            ],
            typeField: '#node-input-locationType',
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['results'],
        });
    },
    oneditsave: function (this: EditorNodeInstance<ApiEditorNodeProperties>) {
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default ApiEditor;
