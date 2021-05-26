/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, ifState: false, nodeVersion: false */
RED.nodes.registerType('poll-state', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 0,
    outputs: 1,
    outputLabels: ["'If State' is true", "'If State' is false"],
    icon: 'ha-poll-state.svg',
    paletteLabel: 'poll state',
    label: function () {
        return this.name || `poll state: ${this.entity_id}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.pollStateVersion },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        updateinterval: { value: '60', validate: (v) => !isNaN(v) },
        updateIntervalUnits: { value: 'seconds' },
        outputinitially: { value: false },
        outputonchanged: { value: false },
        entity_id: { value: '', required: true },
        state_type: { value: 'str' },
        halt_if: { value: '' },
        halt_if_type: { value: 'str' },
        halt_if_compare: { value: 'is' },
        outputs: { value: 1 },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const node = this;

        haServer.init(node, '#node-input-server');
        $('#node-input-entity_id').haAutocomplete();
        $('#node-input-updateinterval').spinner({ min: 1 });

        ifState.init('#node-input-halt_if', '#node-input-halt_if_compare');
        exposeNode.init(node);
    },
    oneditsave: function () {
        const outputs = $('#node-input-halt_if').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.haConfig = exposeNode.getValues();
    },
});
