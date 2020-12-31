RED.nodes.registerType('ha-time', {
    category: 'home_assistant',
    color: ha.nodeColors.alpha,
    outputs: 1,
    icon: 'font-awesome/fa-clock-o',
    paletteLabel: 'time',
    label: function () {
        return (
            this.name ||
            (this.entityId
                ? `${this.entityId}.${this.property || 'state'}`
                : 'time')
        );
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
        entityId: { value: '', required: true },
        property: { value: '' },
        offset: { value: 0 },
        offsetType: { value: 'num' },
        offsetUnits: { value: 'minutes' },
        randomOffset: { value: false },
        repeatDaily: { value: false },
        payload: { value: '$entity().state' },
        payloadType: { value: 'jsonata' },
    },
    oneditprepare: function () {
        const node = this;

        haServer.init(node, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            $('#node-input-entityId').autocomplete({
                source: entities,
                minLength: 0,
            });
        });
        haServer.autocomplete('properties', (properties) => {
            $('#node-input-property').autocomplete({
                source: properties,
                minLength: 0,
            });
        });
        exposeNode.init(this);

        $('#node-input-offset').typedInput({
            types: ['num', 'jsonata'],
            typeField: '#node-input-offsetType',
        });

        $('#node-input-payload').typedInput({
            types: ['str', 'num', 'bool', 'jsonata', 'date'],
            typeField: '#node-input-payloadType',
        });
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
    },
});
