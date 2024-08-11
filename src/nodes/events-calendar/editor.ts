import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { EntityType, NodeType, TypedInputTypes } from '../../const';
import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { insertSocialBar } from '../../editor/socialbar';
import { OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface EventsCalendarEditorNodeProperties extends EditorNodeProperties {
    version: number;
    server: string;
    exposeAsEntityConfig: string;
    entityId: string;
    filter?: string;
    filterType: string;
    eventType: string;
    offset: number;
    offsetType: string;
    offsetUnits: string;
    outputProperties: OutputProperty[];
}

const EventsCalendarEditor: EditorNodeDef<EventsCalendarEditorNodeProperties> =
    {
        category: NodeCategory.HomeAssistant,
        color: NodeColor.Beta,
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
            exposeAsEntityConfig: {
                value: '',
                type: NodeType.EntityConfig,
                // @ts-ignore - DefinitelyTyped is missing this property
                filter: (config) => config.entityType === EntityType.Switch,
                required: false,
            },
            entityId: { value: '', required: true },
            filter: { value: '' },
            filterType: { value: 'str', required: true },
            eventType: { value: 'start', required: true },
            offset: { value: 0, required: true },
            offsetType: { value: 'num', required: true },
            offsetUnits: { value: 'minutes', required: true },
            outputProperties: {
                value: [
                    {
                        property: 'payload',
                        propertyType: TypedInputTypes.Message,
                        value: '',
                        valueType: 'calendarItem',
                    },
                ],
                validate: haOutputs.validate,
            },
        },
        oneditprepare: function () {
            ha.setup(this);
            haServer.init(this, '#node-input-server');
            exposeNode.init(this);
            saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');
            $('#dialog-form').prepend(ha.betaWarning(1295));

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

            haOutputs.createOutputs(this.outputProperties, {
                extraTypes: ['calendarItem'],
            });

            insertSocialBar('events-calendar');
        },
        oneditsave: function () {
            this.outputProperties = haOutputs.getOutputs();
        },
    };

export default EventsCalendarEditor;
