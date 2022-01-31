import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';

declare const RED: EditorRED;

interface GetHistoryEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    startdate: string;
    enddate: string;
    entityid: string;
    entityidtype: string;
    useRelativeTime: boolean;
    relativeTime: string;
    flatten: boolean;
    output_type: string;
    output_location_type: string;
    output_location: string;
}

const GetHistoryEditor: EditorNodeDef<GetHistoryEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
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
        } else if (this.startdate) {
            const startdate = new Date(this.startdate);
            return `${startdate.toLocaleDateString()} ${startdate.toLocaleTimeString()}`;
        }
        return 'get history';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('apiGetHistoryVersion', 0) },
        startdate: { value: '' },
        enddate: { value: '' },
        entityid: { value: '' },
        entityidtype: { value: '' },
        useRelativeTime: { value: false },
        relativeTime: { value: '' },
        flatten: { value: true },
        output_type: { value: 'array' },
        output_location_type: { value: 'msg' },
        output_location: { value: 'payload' },
    },
    oneditprepare: function () {
        ha.setup(this);
        this.entityidtype = this.entityidtype || 'is';
        $('#node-input-entityidtype').val(this.entityidtype);

        haServer.init(this, '#node-input-server');

        hassAutocomplete({ root: '#node-input-entityid' });

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
            }
        );

        $('#node-input-output_location').typedInput({
            types: ['msg', 'flow', 'global'],
            typeField: '#node-input-output_location_type',
        });

        $('#node-input-output_type')
            .on('change', (e) => {
                const target = e.target as HTMLSelectElement;
                $('.output-option').toggle(target.value === 'array');
            })
            .trigger('change');
    },
};

export default GetHistoryEditor;
