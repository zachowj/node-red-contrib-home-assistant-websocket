RED.nodes.registerType('server-state-changed', {
    category: 'home_assistant',
    color: '#038FC7',
    inputs: 0,
    outputs: 1,
    outputLabels: nodeVersion.ifStateLabels,
    icon: 'ha-events-state-changed.svg',
    paletteLabel: 'events: state',
    label: function () {
        return (
            this.name ||
            `state_changed: ${this.entityidfilter || 'all entities'}`
        );
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: 1 },
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
        halt_if_type: {},
        halt_if_compare: {},
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
        const $entityidfilter = $('#node-input-entityidfilter');
        const $entityidfiltertype = $('#node-input-entityidfiltertype');
        const node = this;

        nodeVersion.check(this);
        haServer.init(node, '#node-input-server');
        exposeNode.init(node);

        $entityidfilter.val(this.entityidfilter);
        this.entityidfiltertype = this.entityidfiltertype || 'substring';
        $entityidfiltertype.val(this.entityidfiltertype);

        haServer.autocomplete('entities', (entities) => {
            node.availableEntities = entities;
            $entityidfilter.autocomplete({
                source: node.availableEntities,
                minLength: 0,
            });
        });

        if (this.state_type === undefined) {
            $('#node-input-state_type').val('str');
        }

        if (this.halt_if_compare === undefined) {
            $('#node-input-halt_if_compare').val('is');
        }

        ifState.init('#node-input-haltifstate', '#node-input-halt_if_compare');

        $('#node-input-for').typedInput({
            default: 'num',
            types: ['num', 'jsonata', 'flow', 'global'],
            typeField: '#node-input-forType',
        });
    },
    oneditsave: function () {
        this.entityidfilter = $('#node-input-entityidfilter').val();
        let outputs = $('#node-input-haltifstate').val() ? 2 : 1;
        // Swap inputs for the new 'if state' location
        if (this.version === 0 && outputs === 2) {
            outputs = JSON.stringify({
                0: 1,
                1: 0,
            });
        }
        $('#node-input-outputs').val(outputs);
        nodeVersion.update(this);
        this.haConfig = exposeNode.getValues();
    },
});
