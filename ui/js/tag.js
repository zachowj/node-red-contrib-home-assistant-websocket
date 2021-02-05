/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, nodeVersion: false */
RED.nodes.registerType('ha-tag', {
    category: 'home_assistant',
    color: ha.nodeColors.beta,
    outputs: 1,
    icon: 'font-awesome/fa-tag',
    paletteLabel: 'tag',
    label: function () {
        return this.name || 'tag';
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        server: { value: '', type: 'server', required: true },
        name: { value: '' },
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
        const $tags = $('#tags');
        const $devices = $('#devices');
        let tags = [];

        haServer.init(this, '#node-input-server');
        haServer.autocomplete('tags', (data) => {
            tags = data;
            $tags.editableList('addItems', this.tags);
            tagCountUpdate();
        });
        exposeNode.init(this);

        $('#dialog-form').prepend(ha.betaWarning(348));

        const tagCountUpdate = () => {
            $('#no-tags-found').toggle(tags.length === 0);
        };

        const updateTagList = (data) => {
            tags = data;
            const currentTagData = new Set();
            // save current list of tag ids
            $tags.editableList('items').each(function () {
                const val = $(this).find('select').val();
                currentTagData.add(val);
            });
            // Filter out tags that no longer exists
            const list = Array.from(currentTagData).filter((item) =>
                tags.find((tag) => tag.id === item)
            );
            // Create new list
            $tags.editableList('empty').editableList('addItems', list);
            tagCountUpdate();
        };

        $('#update-tag-list').on('click', () => {
            haServer.getJSON(updateTagList, 'tags', {
                params: { update: true },
            });
        });

        const buildSelect = (row, data) => {
            const $select = $('<select>').appendTo(row);
            tags.forEach((tag) => {
                $('<option>')
                    .attr({ value: tag.id, selected: tag.id === data })
                    .text(tag.name)
                    .appendTo($select);
            });
        };

        $tags.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append('Tags'),
            addItem: function (container, _, data) {
                const $row = $('<div />').appendTo(container);
                $('<span />', {
                    text: 'Tag',
                    style: 'padding-right: 74px;',
                }).appendTo($row);

                buildSelect($row, data);
            },
        });

        $devices.editableList({
            addButton: true,
            removable: true,
            height: 'auto',
            header: $('<div>').append('Devices'),
            addItem: function (container, _, data) {
                const $row = $('<div />').appendTo(container);
                $('<span />', {
                    text: 'Device ID',
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
