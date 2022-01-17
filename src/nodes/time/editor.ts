import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import * as haData from '../../editor/data';
import * as exposeNode from '../../editor/exposenode';
import * as ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { hassAutocomplete } from '../../editor/hassAutocomplete';
import * as nodeVersion from '../../editor/nodeversion';
import * as haOutputs from '../../editor/output-properties';
import { HassExposedConfig, OutputProperty } from '../../editor/types';

declare const RED: EditorRED;

interface TimeEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    exposeToHomeAssistant: boolean;
    haConfig: HassExposedConfig[];
    entityId: string;
    property: string;
    offset: string;
    offsetType: string;
    offsetUnits: string;
    randomOffset: boolean;
    repeatDaily: boolean;
    outputProperties: OutputProperty[];
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    debugenabled: boolean;
    // deprecated but still needed for imports of old flows
    payload?: string;
    payloadType?: string;
}

const TimeEditor: EditorNodeDef<TimeEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    outputs: 1,
    icon: 'font-awesome/fa-clock-o',
    paletteLabel: 'time',
    label: function () {
        return (
            this.name ||
            (this.entityId
                ? `${this.entityId}.${this.property || 'state'}`
                : 'time')
        );
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('haTimeVersion', 0) },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        entityId: { value: '', required: true },
        property: { value: '' },
        offset: { value: '0' },
        offsetType: { value: 'num' },
        offsetUnits: { value: 'minutes' },
        randomOffset: { value: false },
        repeatDaily: { value: false },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'data',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entity',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                },
            ],
            validate: haOutputs.validate,
        },
        sunday: { value: true },
        monday: { value: true },
        tuesday: { value: true },
        wednesday: { value: true },
        thursday: { value: true },
        friday: { value: true },
        saturday: { value: true },
        debugenabled: { value: false },
        // deprecated but still needed for imports of old flows
        payload: { value: undefined },
        payloadType: { value: undefined },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const $server = $('#node-input-server');
        const $entityId = $('#node-input-entityId');

        haServer.init(this, '#node-input-server');
        exposeNode.init(this);

        hassAutocomplete({ root: '#node-input-entityId' });
        $('#node-input-property').autocomplete({
            source: (request: any, response: any) => {
                const properties = haData.getProperties(
                    $server.val() as string,
                    $entityId.val() as string
                );
                response($.ui.autocomplete.filter(properties, request.term));
            },
            minLength: 0,
        });

        $('#node-input-offset').typedInput({
            types: ['num', 'jsonata'],
            typeField: '#node-input-offsetType',
        });

        $('#node-input-payload').typedInput({
            types: ['str', 'num', 'bool', 'jsonata', 'date'],
            typeField: '#node-input-payloadType',
        });

        $('#node-input-repeatDaily')
            .on('change', function () {
                $('#days-of-the-week').toggle($(this).is(':checked'));
            })
            .trigger('change');

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entityState', 'entityId', 'entity'],
        });
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default TimeEditor;
