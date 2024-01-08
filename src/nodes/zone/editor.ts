import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { EntityType, NodeType } from '../../const';
import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface ZoneEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    entities: string[];
    event: 'enter' | 'leave' | 'enter_leave';
    zones: string[];
    exposeAsEntityConfig: string;

    // deprecated but needed for migration
    exposeToHomeAssistant: undefined;
    haConfig: undefined;
}

const ZoneEditor: EditorNodeDef<ZoneEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    outputs: 1,
    icon: 'font-awesome/fa-map-marker',
    paletteLabel: 'zone',
    label: function () {
        return this.name || 'zone';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haZoneVersion', 0) },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        entities: {
            value: [''],
            required: true,
            validate: (v) => !!v.length,
        },
        event: { value: 'enter' },
        zones: {
            value: [''],
            required: true,
            validate: (v) => !!v.length,
        },

        // deprecated but still needed for imports of old flows
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        const $entities = $('#entities');
        const $zones = $('#zones');

        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        $entities.editableList<string[]>({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append('Entities'),
            addItem: function (container, _, data) {
                const $row = $('<div />').appendTo(container);
                $('<span />', {
                    text: 'Entity',
                    style: 'padding-right: 35px;',
                }).appendTo($row);
                const value = $.isEmptyObject(data) ? '' : data;
                const $input = $('<input />', {
                    type: 'text',
                    class: 'input-entity',
                })
                    .appendTo($row)
                    .val(value);
                hassAutocomplete({
                    root: $input,
                    options: { type: 'trackers' },
                });
            },
        });
        $entities.editableList('addItems', this.entities as any);
        $zones.editableList<string[]>({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append('zones'),
            addItem: function (container, _, data) {
                const $row = $('<div />').appendTo(container);
                $('<span />', {
                    text: 'Zone',
                    style: 'padding-right: 35px;',
                }).appendTo($row);
                const value = $.isEmptyObject(data) ? '' : data;
                const $input = $('<input />', {
                    type: 'text',
                    class: 'input-zone',
                })
                    .appendTo($row)
                    .val(value);
                hassAutocomplete({
                    root: $input,
                    options: { type: 'zones' },
                });
            },
        });
        $zones.editableList('addItems', this.zones as any);
    },
    oneditsave: function () {
        const entityList = $('#entities').editableList('items');
        const zoneList = $('#zones').editableList('items');
        const entities = new Set<string>();
        const zones = new Set<string>();
        entityList.each(function () {
            const val = ($(this).find('.input-entity').val() as string).replace(
                /\s/g,
                '',
            );
            if (val.length) {
                entities.add(val);
            }
        });
        zoneList.each(function () {
            const val = ($(this).find('.input-zone').val() as string).replace(
                /\s/g,
                '',
            );
            if (val.length) {
                zones.add(val);
            }
        });
        this.entities = Array.from(entities);
        this.zones = Array.from(zones);
    },
};

export default ZoneEditor;
