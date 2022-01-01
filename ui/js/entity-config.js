/* global RED: false, $: false, nodeVersion: false */
RED.nodes.registerType('ha-entity-config', {
    category: 'config',
    defaults: {
        server: {
            value: '',
            required: true,
        },
        name: { value: '' },
        version: { value: RED.settings.serverVersion },
        haConfig: { value: [] },
        entityType: { value: 'button', required: true },
    },
    label: function () {
        return this.name || `${this.entityType} ${this.id}`;
    },
    oneditprepare: function () {
        nodeVersion.check(this);

        const haConfigOptions = {
            button: [
                { id: 'name', type: 'string' },
                { id: 'icon', type: 'string' },
                {
                    id: 'device_class',
                    type: 'select',
                    values: [
                        { value: '', text: '' },
                        { value: 'restart', text: 'restart' },
                        { value: 'update', text: 'update' },
                    ],
                },
            ],
            binary_sensor: [
                { id: 'name', type: 'string' },
                { id: 'device_class', type: 'string' },
                { id: 'icon', type: 'string' },
                { id: 'unit_of_measurement', type: 'string' },
            ],
            sensor: [
                { id: 'name', type: 'string' },
                { id: 'device_class', type: 'string' },
                { id: 'icon', type: 'string' },
                { id: 'unit_of_measurement', type: 'string' },
                { id: 'state_class', type: 'string' },
                { id: 'last_reset', type: 'date' },
            ],
            switch: [
                { id: 'name', type: 'string' },
                { id: 'icon', type: 'string' },
            ],
        };

        RED.nodes.eachConfig((n) => {
            if (n.type === 'server') {
                $('#node-config-input-server').append(
                    `<option value="${n.id}" ${
                        this.server === n.id && 'selected'
                    }>${n.name}</option>`
                );
            }
        });

        const container = $('#node-config-dialog-edit-form');
        const createInput = (id, value, data) => {
            return $('<input />', {
                type: 'text',
                name: 'value',
                value: value,
                id: id,
                'data-property': data.id,
            }).attr('autocomplete', 'off');
        };
        const createSelect = (id, selectedValue, data) => {
            const $select = $('<select />', {
                name: 'value',
                id: id,
                style: 'width: 70%',
                'data-property': data.id,
            });
            const i18n = 'ha-entity-config.label.select_option';
            data.values.forEach((v) => {
                $('<option />', {
                    value: v.value,
                    text: v.text ? this._(`${i18n}.${v.text}`) : '',
                    selected: v.value === selectedValue,
                }).appendTo($select);
            });
            return $select;
        };
        const createRow = (data) => {
            const id = `ha-config-${data.id}`;
            const $row = $('<div />', {
                class: 'form-row ha-config-row',
                'data-type': data.type,
            }).appendTo(container);
            $('<label>', { for: id })
                .text(this._(`ha-entity-config.label.${data.id}`))
                .appendTo($row);
            $row.append(' ');
            const value =
                this.haConfig.find((c) => c.property === data.id)?.value ?? '';

            switch (data.type) {
                case 'string':
                    $row.append(createInput(id, value, data));
                    break;
                case 'select': {
                    $row.append(createSelect(id, value, data));
                    break;
                }
            }
        };

        $('#node-config-input-entityType').on('change', function () {
            const value = $(this).val();
            $('.ha-config-row').remove();
            haConfigOptions[value].forEach(createRow);
        });
    },
    oneditsave: function () {
        const haConfig = [];
        $('.ha-config-row').each(function () {
            const $this = $(this);
            const type = $this.data('type');
            switch (type) {
                case 'string': {
                    const id = $this.find('input').data('property');
                    const value = $this.find('input').val();
                    haConfig.push({ property: id, value });
                    break;
                }
                case 'select': {
                    const $select = $this.find('select');
                    const id = $select.data('property');
                    const value = $select.val();
                    haConfig.push({ property: id, value });
                    break;
                }
            }
        });
        this.haConfig = haConfig;
    },
});
