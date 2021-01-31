RED.nodes.registerType('server-events', {
    category: 'home_assistant',
    color: '#399CDF',
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        event_type: { value: '', required: false },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        waitForRunning: { value: true },
    },
    inputs: 0,
    outputs: 1,
    icon: 'ha-events-all.svg',
    paletteLabel: 'events: all',
    label: function () {
        return this.name || `events: ${this.event_type || 'all'}`;
    },
    labelStyle: nodeVersion.labelStyle,
    oneditprepare: function () {
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);

        if (this.waitForRunning === undefined) {
            $('#node-input-waitForRunning').prop('checked', true);
        }

        $('#node-input-event_type')
            .on('change keyup', function () {
                $('#eventAlert').toggle($(this).val().length === 0);
            })
            .trigger('change');
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
    },
});
