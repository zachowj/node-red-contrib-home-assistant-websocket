import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { EntityType, NodeType, TAGS_ALL } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import {
    EditorWidgetEditableListOptions,
    OutputProperty,
} from '../../editor/types';
import { HassTag } from '../../types/home-assistant';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface TagEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    tags: string[];
    devices?: string[];
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;

    // deprecated
    exposeToHomeAssistant: undefined;
    haConfig: undefined;
}

const TagEditor: EditorNodeDef<TagEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    outputs: 1,
    icon: 'font-awesome/fa-tag',
    paletteLabel: 'tag',
    label: function () {
        return this.name || 'tag';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haTagVersion', 0) },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        tags: {
            value: [''],
            required: true,
            validate: function (v) {
                return !!v.length;
            },
        },
        devices: {
            value: [],
        },
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
                    value: '',
                    valueType: 'triggerId',
                },
            ],
            validate: haOutputs.validate,
        },

        // deprecated but still needed for imports of old flows
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        exposeNode.init(this);
        const $tags = $('#tags');
        const $devices = $('#devices');
        let tags: HassTag[] = [];
        const i18n = this._;

        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        const buildSelect = (row: JQuery<HTMLElement>, data: string) => {
            const $select = $('<select>', { width: '70%' })
                .append(
                    $('<option>')
                        .attr({
                            value: TAGS_ALL,
                            selected: data === TAGS_ALL,
                        })
                        .text(i18n('ha-tag.label.all_tags')),
                )
                .appendTo(row);
            tags.forEach((tag) => {
                $('<option>')
                    .attr({ value: tag.id, selected: tag.id === data })
                    .text(tag.name || tag.id)
                    .appendTo($select);
            });
        };

        $tags.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append(i18n('ha-tag.label.tags')),
            addItem: function (container, _, data) {
                const $row = $('<div />').appendTo(container);
                $('<span />', {
                    text: i18n('ha-tag.label.tag'),
                    style: 'padding-right: 74px;',
                }).appendTo($row);

                buildSelect($row, data);
            },

            buttons: [
                {
                    id: 'ha-tag-update-tag-list',
                    label: i18n('ha-tag.label.update_tag_list'),
                    icon: 'fa fa-refresh',
                    click: () => {
                        haServer.getJSON(updateTagList, 'tags', {
                            params: { update: true },
                        });
                    },
                },
            ],
        } as unknown as EditorWidgetEditableListOptions<string>);
        // Move update button to the right
        $('#ha-tag-update-tag-list')
            .css('float', 'right')
            .css('margin-right', 'unset');

        const tagCountUpdate = () => {
            $('#no-tags-found').toggle(tags.length === 0);
        };

        function sortByName(a: HassTag, b: HassTag) {
            const aName = a.name || a.tag_id;
            const bName = b.name || b.tag_id;
            if (aName === bName) return 0;
            return aName.localeCompare(bName);
        }

        const updateTagList = (data: HassTag[]) => {
            tags = data.sort(sortByName);
            const currentTagData = new Set<string>();
            // save current list of tag ids
            $tags.editableList('items').each(function () {
                const val = $(this).find('select').val() as string;
                currentTagData.add(val);
            });
            // Filter out tags that no longer exists
            const list = Array.from(currentTagData).filter((item) => {
                if (item === TAGS_ALL) {
                    return true;
                }

                return tags.find((tag) => tag.id === item);
            });

            // Create new list
            $tags.editableList('empty');
            $tags.editableList('addItems', list as any[]);
            tagCountUpdate();
        };

        haServer.init(this, '#node-input-server');
        haServer.autocomplete('tags', (data: HassTag[]) => {
            tags = data;
            $tags.editableList('addItems', this.tags as any[]);
            updateTagList(data);
        });

        $('#update-tag-list').on('click', () => {
            haServer.getJSON(updateTagList, 'tags', {
                params: { update: true },
            });
        });

        $devices.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append(i18n('ha-tag.label.devices')),
            addItem: function (container, _, data: string) {
                const $row = $('<div />').appendTo(container);
                $('<span />', {
                    text: i18n('ha-tag.label.device_id'),
                    style: 'padding-right: 35px;',
                }).appendTo($row);
                const value = $.isEmptyObject(data) ? '' : data;
                $('<input />', { type: 'text', class: 'input-device' })
                    .appendTo($row)
                    .val(value);
            },
        });
        $devices.editableList('addItems', this.devices as any[]);

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['eventData', 'tagId'],
        });
    },
    oneditsave: function () {
        const tagList = $('#tags').editableList('items');
        const deviceList = $('#devices').editableList('items');
        const tags = new Set<string>();
        const devices = new Set<string>();
        tagList.each(function () {
            const val = $(this).find('select').val() as string;
            tags.add(val);
        });
        deviceList.each(function () {
            const val = $(this).find('.input-device').val() as string;

            if (val.trim().replace(/\s/g, '').length) {
                devices.add(val);
            }
        });
        this.tags = Array.from(tags);
        this.devices = Array.from(devices);
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default TagEditor;
