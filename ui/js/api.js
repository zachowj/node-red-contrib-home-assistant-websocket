/* global RED: false, $: false, ha: false, haServer: false, nodeVersion: false, haOutputs: false */
RED.nodes.registerType('ha-api', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-paper-plane-o',
    paletteLabel: 'API',
    label: function () {
        return this.name || 'API';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.haApiVersion },
        debugenabled: { value: false },
        protocol: { value: 'websocket' },
        method: { value: 'get' },
        path: { value: '' },
        data: { value: '' },
        dataType: { value: 'jsonata' },
        responseType: { value: 'json' },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'results',
                },
            ],
            validate: haOutputs.validate,
        },
        // deprecated but still needed for imports of old flows
        location: { value: undefined },
        locationType: { value: undefined },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        haServer.init(this, '#node-input-server');

        $('#node-input-data').typedInput({
            types: ['json', 'jsonata'],
            typeField: '#node-input-dataType',
        });

        $('#node-input-protocol')
            .on('change', function () {
                const isHttp = $(this).val() === 'http';
                $('.http').toggle(isHttp);
                $('#node-input-method').trigger('change');
            })
            .trigger('change');

        $('#node-input-method').on('change', function () {
            const label =
                $('#node-input-protocol').val() === 'http' &&
                $('#node-input-method').val() === 'get'
                    ? 'Params'
                    : 'Data';
            $('#data-label').text(label);
        });

        $('#node-input-location').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                { value: 'none', label: 'None', hasValue: false },
            ],
            typeField: '#node-input-locationType',
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['results'],
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
});
