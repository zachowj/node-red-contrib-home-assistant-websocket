import { EditorNodeDef, EditorRED } from 'node-red';

import { EntityType, NodeType } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HassNodeProperties, OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface EventsAllEditorNodeProperties extends HassNodeProperties {
    server: string;
    version: number;
    exposeAsEntityConfig: string;
    eventType: string;
    eventData: Record<string, unknown>;
    waitForRunning: boolean;
    outputProperties: OutputProperty[];

    // Deprecated
    exposeToHomeAssistant: undefined;
    haConfig: undefined;
    event_type: undefined;
}

const EventsAllEditor: EditorNodeDef<EventsAllEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('serverEventsVersion', 0) },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        eventType: { value: '', required: false },
        eventData: {
            value: '',
            // @ts-expect-error - DefinitelyTyped is missing this property
            validate: RED.validators.typedInput({
                allowBlank: true,
            }),
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
        event_type: { value: undefined },
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
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
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        $('#node-input-eventData').typedInput({
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
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default EventsAllEditor;
