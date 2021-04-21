/* global RED: false, $: false, exposeNode: false, ha: false, haServer:false, nodeVersion: false, haData: false */
RED.nodes.registerType('ha-time', {
    category: 'home_assistant',
    color: ha.nodeColors.beta,
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
        payload: { value: '$entity().state' },
        payloadType: { value: 'jsonata' },
        debugenabled: { value: true },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const $server = $('#node-input-server');
        const $entityId = $('#node-input-entityId');

        haServer.init(this, '#node-input-server');
        $entityId.autocomplete({
            source: (request, response) => {
                const entities = haData.getAutocomplete(
                    $server.val(),
                    'entities'
                );
                response($.ui.autocomplete.filter(entities, request.term));
            },
            minLength: 0,
        });

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
        $('#dialog-form').prepend(ha.betaWarning(313));

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
