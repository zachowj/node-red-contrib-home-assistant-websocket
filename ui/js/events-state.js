/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, ifState: false, nodeVersion: false */
RED.nodes.registerType('server-state-changed', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 0,
    outputs: 1,
    outputLabels: ["'If State' is true", "'If State' is false"],
    icon: 'ha-events-state-changed.svg',
    paletteLabel: 'events: state',
    label: function () {
        return (
            this.name ||
            `state_changed: ${this.entityidfilter || 'all entities'}`
        );
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.serverStateChangedVersion },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        entityidfilter: { value: '', required: true },
        entityidfiltertype: { value: 'exact' },
        outputinitially: { value: false },
        state_type: { value: 'str' },
        haltifstate: { value: '' },
        halt_if_type: { value: 'str' },
        halt_if_compare: { value: 'is' },
        outputs: { value: 1 },
        output_only_on_state_change: { value: true },
        for: { value: 0 },
        forType: { value: 'num' },
        forUnits: { value: 'minutes' },
        ignorePrevStateNull: { value: false },
        ignorePrevStateUnknown: { value: false },
        ignorePrevStateUnavailable: { value: false },
        ignoreCurrentStateUnknown: { value: false },
        ignoreCurrentStateUnavailable: { value: false },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const $entityidfilter = $('#node-input-entityidfilter');
        const node = this;

        haServer.init(node, '#node-input-server');
        exposeNode.init(node);

        haServer.autocomplete('entities', (entities) => {
            node.availableEntities = entities;
            $entityidfilter.autocomplete({
                source: node.availableEntities,
                minLength: 0,
            });
        });

        ifState.init('#node-input-haltifstate', '#node-input-halt_if_compare');

        $('#node-input-for').typedInput({
            default: 'num',
            types: ['num', 'jsonata', 'flow', 'global'],
            typeField: '#node-input-forType',
        });
    },
    oneditsave: function () {
        const outputs = $('#node-input-haltifstate').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.haConfig = exposeNode.getValues();
    },
});
