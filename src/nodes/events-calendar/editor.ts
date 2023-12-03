import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import ha, { NodeCategory, NodeColor } from '../../editor/ha';

declare const RED: EditorRED;

interface EventsCalendarEditorNodeProperties extends EditorNodeProperties {
    version: number;
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
            version: { value: RED.settings.get('eventsCalendarVersion', 0) },
        },
    };

export default EventsCalendarEditor;
