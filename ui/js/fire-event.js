/* global RED: false, $: false, ha: false, haServer: false, nodeVersion: false */
RED.nodes.registerType('ha-fire-event', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-fire-event.svg',
    align: 'right',
    paletteLabel: 'fire event',
    label: function () {
        return this.name || `Event: ${this.event}`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        event: { value: '' },
        data: { value: '' },
        dataType: { value: 'jsonata' },
    },
    oneditprepare: function () {
        const node = this;
        haServer.init(node, '#node-input-server');

        $('#node-input-data').typedInput({
            types: ['json', 'jsonata'],
            typeField: '#node-input-dataType',
        });
    },
});
