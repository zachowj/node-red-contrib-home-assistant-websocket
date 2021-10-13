/* global RED: false, $: false, exposeNode: false, ha: false, haServer:false, nodeVersion: false, haData: false, haOutputs: false */
RED.nodes.registerType('ha-time', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
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
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.haTimeVersion },
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
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'data',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entity',
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
        sunday: { value: true },
        monday: { value: true },
        tuesday: { value: true },
        wednesday: { value: true },
        thursday: { value: true },
        friday: { value: true },
        saturday: { value: true },
        debugenabled: { value: false },
        // deprecated but still needed for imports of old flows
        payload: { value: undefined },
        payloadType: { value: undefined },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const $server = $('#node-input-server');
        const $entityId = $('#node-input-entityId');

        haServer.init(this, '#node-input-server');
        $entityId.haAutocomplete();
        $('#node-input-property').autocomplete({
            source: (request, response) => {
                const properties = haData.getProperties(
                    $server.val(),
                    $entityId.val()
                );
                response($.ui.autocomplete.filter(properties, request.term));
            },
            minLength: 0,
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

        $('#node-input-repeatDaily')
            .on('change', function () {
                $('#days-of-the-week').toggle($(this).is(':checked'));
            })
            .trigger('change');

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entityState', 'entityId', 'entity'],
        });
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
        this.outputProperties = haOutputs.getOutputs();
    },
});
