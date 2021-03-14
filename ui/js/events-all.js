/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, nodeVersion: false, haOutputs: false */
RED.nodes.registerType('server-events', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.serverEventsVersion },
        event_type: { value: '', required: false },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        waitForRunning: { value: true },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'eventData',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '$eventData().event_type',
                    valueType: 'jsonata',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    inputs: 0,
    outputs: 1,
    icon: 'ha-events-all.svg',
    paletteLabel: 'events: all',
    label: function () {
        return this.name || `events: ${this.event_type || 'all'}`;
    },
    labelStyle: ha.labelStyle,
    oneditprepare: function () {
        nodeVersion.check(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);

        $('#node-input-event_type').on('change keyup', function () {
            $('#eventAlert').toggle($(this).val().length === 0);
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['eventData'],
        });
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
        this.outputProperties = haOutputs.getOutputs();
    },
});
