RED.nodes.registerType('ha-zone', {
    category: 'home_assistant',
    color: '#038FC7',
    outputs: 1,
    icon: 'font-awesome/fa-map-marker',
    paletteLabel: 'zone',
    label: function () {
        return this.name || 'zone';
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
        entities: {
            value: [''],
            required: true,
            validate: function (v) {
                return v.length;
            },
        },
        event: { value: 'enter' },
        zones: {
            value: [''],
            required: true,
            validate: function (v) {
                return v.length;
            },
        },
    },
    oneditprepare: function () {
        const $entities = $('#entities');
        const $zones = $('#zones');
        let zones = [];
        let devices = [];

        haServer.init(this, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            devices = entities.filter(
                (entities) =>
                    entities.startsWith('person.') ||
                    entities.startsWith('device_tracker.')
            );
            zones = entities.filter((entities) => entities.startsWith('zone.'));
        });
        exposeNode.init(this);

        $entities.editableList({
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
                $('<input />', { type: 'text', class: 'input-entity' })
                    .appendTo($row)
                    .val(value)
                    .autocomplete({ source: devices, minLength: 0 });
            },
        });
        $entities.editableList('addItems', this.entities);
        $zones.editableList({
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
                $('<input />', { type: 'text', class: 'input-zone' })
                    .appendTo($row)
                    .val(value)
                    .autocomplete({ source: zones, minLength: 0 });
            },
        });
        $zones.editableList('addItems', this.zones);
    },
    oneditsave: function () {
        const entityList = $('#entities').editableList('items');
        const zoneList = $('#zones').editableList('items');
        const entities = new Set();
        const zones = new Set();
        entityList.each(function () {
            const val = $(this).find('.input-entity').val().replace(/\s/g, '');
            if (val.length) {
                entities.add(val);
            }
        });
        zoneList.each(function () {
            const val = $(this).find('.input-zone').val().replace(/\s/g, '');
            if (val.length) {
                zones.add(val);
            }
        });
        this.entities = Array.from(entities);
        this.zones = Array.from(zones);
        this.haConfig = exposeNode.getValues();
    },
});
