import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';

declare const RED: EditorRED;

interface EventsCalendarEditorNodeProperties extends EditorNodeProperties {
    version: number;
    server: string;
    entityId: string;
    filter?: string;
    filterType: string;
    eventType: string;
    offset: number;
    offsetType: string;
    offsetUnits: string;
}

const EventsCalendarEditor: EditorNodeDef<EventsCalendarEditorNodeProperties> =
    {
        category: NodeCategory.HomeAssistant,
        color: NodeColor.HaBlue,
        inputs: 0,
        outputs: 1,
        outputLabels: ['Calendar event triggered'],
        icon: 'ha-events-calendar.svg',
        paletteLabel: 'events: calendar',
        label: function () {
            return this.name || `calendar_event`;
        },
        labelStyle: ha.labelStyle,
        defaults: {
            name: { value: '' },
            version: { value: RED.settings.get('eventsCalendarVersion', 0) },
            server: { value: '', type: NodeType.Server, required: true },
            entityId: { value: '', required: true },
            filter: { value: '' },
            filterType: { value: 'str', required: true },
            eventType: { value: 'start', required: true },
            offset: { value: 0, required: true },
            offsetType: { value: 'num', required: true },
            offsetUnits: { value: 'minutes', required: true },
        },
        oneditprepare: function () {
            ha.setup(this);
            haServer.init(this, '#node-input-server');

            hassAutocomplete({
                root: '#node-input-entityId',
                options: { type: 'calendars' },
            });

            $('#node-input-offset').typedInput({
                default: 'num',
                types: ['num', 'jsonata'],
                typeField: '#node-input-offsetType',
            });

            $('#node-input-filter').typedInput({
                types: ['str', 'jsonata'],
                typeField: '#node-input-filterType',
            });
        },
    };

export default EventsCalendarEditor;
