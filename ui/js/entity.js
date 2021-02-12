/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, nodeVersion: false */
RED.nodes.registerType('ha-entity', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    icon: function () {
        const icon =
            this.entityType === 'switch'
                ? 'ha-entity-switch.svg'
                : 'font-awesome/fa-genderless';

        return icon;
    },
    align: 'right',
    paletteLabel: 'entity',
    label: function () {
        return this.name || `type: ${this.entityType}`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: 1 },
        debugenabled: { value: false },
        outputs: { value: 1 },
        entityType: { value: 'sensor' },
        config: {
            value: [
                { property: 'name', value: '' },
                { property: 'device_class', value: '' },
                { property: 'icon', value: '' },
                { property: 'unit_of_measurement', value: '' },
            ],
        },
        // sensor binary_sensor
        state: { value: 'payload' },
        stateType: { value: 'msg' },
        attributes: { value: [] },
        resend: { value: true },
        outputLocation: { value: 'payload' },
        outputLocationType: { value: 'none' },
        inputOverride: { value: 'allow' },
        // switch
        outputOnStateChange: { value: false },
        outputPayload: { value: '$entity().state ? "on": "off"' },
        outputPayloadType: { value: 'jsonata' },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const node = this;
        const stateTypes = {
            binary_sensor: [
                'msg',
                'flow',
                'global',
                'jsonata',
                'str',
                'num',
                'bool',
            ],
            sensor: [
                'msg',
                'flow',
                'global',
                'jsonata',
                'str',
                'num',
                'bool',
                'date',
            ],
            switch: ['msg'],
        };
        const haConfigOptions = {
            binary_sensor: [
                'name',
                'device_class',
                'icon',
                'unit_of_measurement',
            ],
            sensor: ['name', 'device_class', 'icon', 'unit_of_measurement'],
            switch: ['name', 'icon'],
        };
        const attributeTypes = [
            'str',
            'num',
            'bool',
            'date',
            'jsonata',
            'msg',
            'flow',
            'global',
        ];
        const rows = {
            binary_sensor: [
                'state',
                'attributes',
                'output-location',
                'input-override',
                'resend',
                'debug',
            ],
            sensor: [
                'state',
                'attributes',
                'output-location',
                'input-override',
                'resend',
                'debug',
            ],
            switch: ['output-on-state-change', 'output-payload'],
        };

        haServer.init(node, '#node-input-server');

        exposeNode.init(node);

        $('#node-input-state').typedInput({
            types: stateTypes[$('#node-input-entityType').val()],
            typeField: '#node-input-stateType',
            type: node.stateType,
        });

        $('#attributes')
            .editableList({
                removable: true,
                addButton: 'add attribute',
                header: $('<div>').append(
                    $.parseHTML(
                        "<div style='width:40%; display: inline-grid'>Attribute Key</div><div style='display: inline-grid'>Value</div>"
                    )
                ),
                addItem: function (container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        style: 'width: 40%;margin-right: 5px;',
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row)
                        .val(data.property);
                    const $value = $('<input />', {
                        type: 'text',
                        name: 'value',
                        style: 'width: 55%;',
                    })
                        .appendTo($row)
                        .val(data.value)
                        .typedInput({ types: attributeTypes });
                    $value.typedInput('type', data.valueType);
                },
            })
            .editableList('addItems', node.attributes);

        $('#config')
            .editableList({
                addButton: false,
                header: $('<div>Home Assistant Config (optional)</div>'),
                addItem: function (container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        value: data.property,
                        style: 'width: 40%;',
                        readonly: true,
                    }).appendTo($row);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                        style: 'margin-left: 10px;width: 55%;',
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row);
                },
            })
            .editableList('addItems', node.config);

        const noneTypedInput = {
            value: 'none',
            label: 'none',
            hasValue: false,
        };
        $('#node-input-outputLocation').typedInput({
            types: ['msg', 'flow', 'global', noneTypedInput],
            typeField: '#node-input-outputLocationType',
        });

        $('#node-input-outputPayload').typedInput({
            types: ['str', 'num', 'bool', 'jsonata', 'date', noneTypedInput],
            typeField: '#node-input-outputPayloadType',
        });

        $('#node-input-entityType')
            .on('change', function () {
                const value = $(this).val();

                $('#node-input-state').typedInput('types', stateTypes[value]);

                // Show/hide rows optional-row based on the rows map
                $('#dialog-form .form-row').each(function () {
                    const $this = $(this);
                    const classes = $this.attr('class').split(' ');
                    if (classes.includes('optional-row')) {
                        const id = $this.attr('id');
                        $this.toggle(
                            rows[value].includes(id.replace(/-row$/, ''))
                        );
                    }
                });

                switch (value) {
                    case 'switch':
                        node.outputs = 2;
                        // filter config options
                        $('#config').editableList('filter', (data) =>
                            haConfigOptions[value].includes(data.property)
                        );
                        break;
                    case 'binary_sensor':
                    case 'sensor':
                    default:
                        node.outputs = 1;
                        // Show all config items
                        $('#config').editableList('filter', null);
                        $('#node-input-outputOnStateChange')
                            .prop('checked', false)
                            .trigger('change');
                        break;
                }
            })
            .trigger('change');

        $('#node-input-outputOnStateChange')
            .on('change', function () {
                if (
                    $('#node-input-entityType').val() === 'switch' &&
                    $(this).prop('checked')
                ) {
                    $('#output-payload-row').show();
                } else {
                    $('#output-payload-row').hide();
                }
            })
            .trigger('change');
    },
    oneditsave: function () {
        const node = this;
        node.attributes = [];
        node.config = [];
        nodeVersion.update(this);

        $('#attributes')
            .editableList('items')
            .each(function (i) {
                const $row = $(this);
                node.attributes.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').typedInput('value'),
                    valueType: $row
                        .find('input[name=value]')
                        .typedInput('type'),
                });
            });

        $('#config')
            .editableList('items')
            .each(function (i) {
                const $row = $(this);
                node.config.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').val(),
                });
            });
    },
});
