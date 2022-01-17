import { EditorNodeDef, EditorRED } from 'node-red';

import * as exposeNode from '../../editor/exposenode';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import * as haOutputs from '../../editor/output-properties';
import {
    HassExposedConfig,
    HassNodeProperties,
    OutputProperty,
} from '../../editor/types';

declare const RED: EditorRED;

interface EventsAllEditorNodeProperties extends HassNodeProperties {
    server: string;
    version: number;
    event_type: string;
    exposeToHomeAssistant: boolean;
    haConfig: HassExposedConfig[];
    waitForRunning: boolean;
    outputProperties: OutputProperty[];
}

const EventsAllEditor: EditorNodeDef<EventsAllEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('serverEventsVersion', 0) },
        event_type: { value: '', required: false },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        waitForRunning: { value: true },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'eventData',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '$outputData("eventData").event_type',
                    valueType: 'jsonata',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    inputs: 0,
    outputs: 1,
    icon: 'ha-events-all.svg',
    paletteLabel: 'events: all',
    label: function () {
        return this.name || `events: ${this.event_type || 'all'}`;
    },
    labelStyle: ha.labelStyle,
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);

        $('#node-input-event_type').on(
            'change keyup',
            function (this: HTMLInputElement) {
                const type = $(this).val() as string;
                $('#eventAlert').toggle(type.length === 0);
            }
        );

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['eventData'],
        });
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default EventsAllEditor;
