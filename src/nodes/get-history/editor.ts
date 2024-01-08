import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType, TypedInputTypes } from '../../const';
import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { EntityFilterType, OutputType } from './const';

declare const RED: EditorRED;

interface GetHistoryEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    startDate: string;
    endDate: string;
    entityId: string;
    entityIdType: EntityFilterType;
    useRelativeTime: boolean;
    relativeTime: string;
    flatten: boolean;
    outputType: OutputType;
    outputLocationType: TypedInputTypes;
    outputLocation: string;

    // deprecated
    startdate: undefined;
    enddate: undefined;
    entityid: undefined;
    entityidtype: undefined;
    output_type: undefined;
    output_location_type: undefined;
    output_location: undefined;
}

const GetHistoryEditor: EditorNodeDef<GetHistoryEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-get-history.svg',
    paletteLabel: 'get history',
    label: function () {
        if (this.name) {
            return this.name;
        }
        if (this.useRelativeTime && this.relativeTime) {
            return this.relativeTime;
        } else if (this.startDate) {
            const startDate = new Date(this.startDate);
            return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
        }
        return 'get history';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('apiGetHistoryVersion', 0) },
        startDate: { value: '' },
        endDate: { value: '' },
        entityId: { value: '' },
        entityIdType: { value: EntityFilterType.Equals },
        useRelativeTime: { value: true },
        relativeTime: { value: '' },
        flatten: { value: true },
        outputType: { value: OutputType.Array },
        outputLocationType: { value: TypedInputTypes.Message },
        outputLocation: { value: 'payload' },

        // deprecated
        startdate: { value: undefined },
        enddate: { value: undefined },
        entityid: { value: undefined },
        entityidtype: { value: undefined },
        output_type: { value: undefined },
        output_location_type: { value: undefined },
        output_location: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');

        hassAutocomplete({ root: '#node-input-entityId' });

        $('#node-input-useRelativeTime').on(
            'change',
            function (this: HTMLInputElement) {
                if (this.checked) {
                    $('.relative_row').show();
                    $('.date_row').hide();
                } else {
                    $('.relative_row').hide();
                    $('.date_row').show();
                }
            },
        );

        $('#node-input-outputLocation').typedInput({
            types: [
                TypedInputTypes.Message,
                TypedInputTypes.Flow,
                TypedInputTypes.Global,
            ],
            typeField: '#node-input-outputLocationType',
        });

        $('#node-input-outputType')
            .on('change', (e) => {
                const target = e.target as HTMLSelectElement;
                $('.output-option').toggle(target.value === OutputType.Array);
            })
            .trigger('change');
    },
};

export default GetHistoryEditor;
