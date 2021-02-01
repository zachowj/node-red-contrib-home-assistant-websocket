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
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        debugenabled: { value: false },
        protocol: { value: 'websocket' },
        method: { value: 'get' },
        path: { value: '' },
        data: { value: '' },
        dataType: { value: 'jsonata' },
        location: { value: 'payload' },
        locationType: { value: 'msg' },
        responseType: { value: 'json' },
    },
    oneditprepare: function () {
        const node = this;
        const $server = $('#node-input-server');
        const utils = {
            setDefaultServerSelection: function () {
                let defaultServer;
                RED.nodes.eachConfig((n) => {
                    if (n.type === 'server' && !defaultServer)
                        defaultServer = n.id;
                });
                if (defaultServer) $server.val(defaultServer);
            },
        };

        if (!node.server) {
            utils.setDefaultServerSelection();
        }

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
    },
});
