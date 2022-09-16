import { EditorNodeDef, EditorRED } from 'node-red';

import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import {
    HassExposedConfig,
    HassNodeProperties,
    OutputProperty,
} from '../../editor/types';

declare const RED: EditorRED;

interface EventsAllEditorNodeProperties extends HassNodeProperties {
    server: string;
    version: number;
    eventType: string;
    exposeToHomeAssistant: boolean;
    eventData: Record<string, unknown>;
    haConfig: HassExposedConfig[];
    waitForRunning: boolean;
    outputProperties: OutputProperty[];
    // Deprecated
    event_type: string;
}

const EventsAllEditor: EditorNodeDef<EventsAllEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('serverEventsVersion', 0) },
        eventType: { value: '', required: false },
        exposeToHomeAssistant: { value: false },
        eventData: { value: '', required: false },
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

        // Deprecated
        event_type: { value: '', required: false },
    },
    inputs: 0,
    outputs: 1,
    icon: 'ha-events-all.svg',
    paletteLabel: 'events: all',
    label: function () {
        return this.name || `events: ${this.eventType || 'all'}`;
    },
    labelStyle: ha.labelStyle,
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);

        $('#node-input-eventData')
            .on('change input', function () {
                // hack to hide error border when data field is empty
                const $this = $(this);
                const val = $this.val() as string;
                if (val.length === 0) {
                    $this.next().removeClass('input-error');
                }
            })
            .typedInput({
                types: ['json'],
            });

        $('#node-input-eventType').on(
            'change input',
            function (this: HTMLInputElement) {
                const type = ($(this).val() as string).trim();
                $('#eventAlert').toggle(type.length === 0);
                this.value = type;
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
