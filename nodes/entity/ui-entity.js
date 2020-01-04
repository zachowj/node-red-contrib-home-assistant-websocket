RED.nodes.registerType('ha-entity', {
    category: 'home_assistant',
    color: '#52C0F2',
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-genderless',
    align: 'right',
    paletteLabel: 'sensor',
    label: function() {
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
                { property: 'unit_of_measurement', value: '' }
            ]
        },
        state: { value: 'payload' },
        stateType: { value: 'msg' },
        attributes: { value: [] },
        resend: { value: true },
        outputLocation: { value: 'payload' },
        outputLocationType: { value: 'none' },
        inputOverride: { value: 'allow' }
    },
    oneditprepare: function() {
        nodeVersion.check(this);
        const node = this;
        const stateTypes = {
            sensor: [
                'msg',
                'flow',
                'global',
                'jsonata',
                'str',
                'num',
                'bool',
                'date'
            ],
            binary_sensor: [
                'msg',
                'flow',
                'global',
                'jsonata',
                'str',
                'num',
                'bool'
            ]
        };
        const attributeTypes = [
            'str',
            'num',
            'bool',
            'date',
            'jsonata',
            'msg',
            'flow',
            'global'
        ];

        haServer.init(node, '#node-input-server');

        exposeNode.init(node);

        $('#node-input-state').typedInput({
            types: stateTypes[$('#node-input-entityType').val()],
            typeField: '#node-input-stateType',
            type: node.stateType
        });

        $('#node-input-entityType')
            .on('change', function() {
                $('#node-input-state').typedInput(
                    'types',
                    stateTypes[$(this).val()]
                );
            })
            .trigger('change');

        $('#attributes')
            .editableList({
                removable: true,
                addButton: 'add attribute',
                header: $('<div>').append(
                    $.parseHTML(
                        "<div style='width:40%; display: inline-grid'>Attribute Key</div><div style='display: inline-grid'>Value</div>"
                    )
                ),
                addItem: function(container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        style: 'width: 40%;margin-right: 5px;'
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row)
                        .val(data.property);
                    const $value = $('<input />', {
                        type: 'text',
                        name: 'value',
                        style: 'width: 55%;'
                    })
                        .appendTo($row)
                        .val(data.value)
                        .typedInput({ types: attributeTypes });
                    $value.typedInput('type', data.valueType);
                }
            })
            .editableList('addItems', node.attributes);

        $('#config')
            .editableList({
                addButton: false,
                header: $('<div>Home Assistant Config (optional)</div>'),
                addItem: function(container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        value: data.property,
                        style: 'width: 40%;',
                        readonly: true
                    }).appendTo($row);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                        style: 'margin-left: 10px;width: 55%;'
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row);
                }
            })
            .editableList('addItems', node.config);

        $('#node-input-outputLocation').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                {
                    value: 'none',
                    label: 'None',
                    hasValue: false
                }
            ],
            typeField: '#node-input-outputLocationType'
        });
    },
    oneditsave: function() {
        const node = this;
        node.attributes = [];
        node.config = [];
        nodeVersion.update(this);

        $('#attributes')
            .editableList('items')
            .each(function(i) {
                const $row = $(this);
                node.attributes.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').typedInput('value'),
                    valueType: $row.find('input[name=value]').typedInput('type')
                });
            });

        $('#config')
            .editableList('items')
            .each(function(i) {
                const $row = $(this);
                node.config.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').val()
                });
            });
    }
});
