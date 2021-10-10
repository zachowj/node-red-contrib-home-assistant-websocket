/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, nodeVersion: false */
RED.nodes.registerType('ha-tag', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    outputs: 1,
    icon: 'font-awesome/fa-tag',
    paletteLabel: 'tag',
    label: function () {
        return this.name || 'tag';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.haTagVersion },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        tags: {
            value: [''],
            required: true,
            validate: function (v) {
                return v.length;
            },
        },
        devices: {
            value: [],
        },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const ALL_TAGS = '__ALL_TAGS__';
        const $tags = $('#tags');
        const $devices = $('#devices');
        let tags = [];
        const i18n = this._;

        const buildSelect = (row, data) => {
            const $select = $('<select>', { width: '70%' })
                .append(
                    $('<option>')
                        .attr({
                            value: ALL_TAGS,
                            selected: data === ALL_TAGS,
                        })
                        .text(i18n('ha-tag.label.all_tags'))
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
                    label: i18n('ha-tag.label.update_tag_list'),
                    icon: 'fa fa-refresh',
                    click: () => {
                        haServer.getJSON(updateTagList, 'tags', {
                            params: { update: true },
                        });
                    },
                },
            ],
        });

        const tagCountUpdate = () => {
            $('#no-tags-found').toggle(tags.length === 0);
        };

        function sortByName(a, b) {
            const aName = a.name || a.tag_id;
            const bName = b.name || b.tag_id;
            if (aName === bName) return 0;
            return aName.localeCompare(bName);
        }

        const updateTagList = (data) => {
            tags = data.sort(sortByName);
            const currentTagData = new Set();
            // save current list of tag ids
            $tags.editableList('items').each(function () {
                const val = $(this).find('select').val();
                currentTagData.add(val);
            });
            // Filter out tags that no longer exists
            const list = Array.from(currentTagData).filter((item) => {
                if (item === ALL_TAGS) {
                    return true;
                }

                return tags.find((tag) => tag.id === item);
            });

            // Create new list
            $tags.editableList('empty').editableList('addItems', list);
            tagCountUpdate();
        };

        haServer.init(this, '#node-input-server');
        haServer.autocomplete('tags', (data) => {
            tags = data;
            $tags.editableList('addItems', this.tags);
            updateTagList(data);
        });
        exposeNode.init(this);

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
            addItem: function (container, _, data) {
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
        $devices.editableList('addItems', this.devices);
    },
    oneditsave: function () {
        const tagList = $('#tags').editableList('items');
        const deviceList = $('#devices').editableList('items');
        const tags = new Set();
        const devices = new Set();
        tagList.each(function () {
            const val = $(this).find('select').val();
            tags.add(val);
        });
        deviceList.each(function () {
            const val = $(this).find('.input-device').val().replace(/\s/g, '');
            if (val.length) {
                devices.add(val);
            }
        });
        this.tags = Array.from(tags);
        this.devices = Array.from(devices);
        this.haConfig = exposeNode.getValues();
    },
});
