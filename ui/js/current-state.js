/* global RED: false, $: false, ha: false, haServer: false, ifState: false, nodeVersion: false */
RED.nodes.registerType('api-current-state', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    outputLabels: function (index) {
        if (this.halt_if || this.haltifstate) {
            if (index === 0) return "'If State' is true";
            if (index === 1) return "'If State' is false";
        }
    },
    icon: 'ha-current-state.svg',
    paletteLabel: 'current state',
    label: function () {
        return this.name || `current_state: ${this.entity_id}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.apiCurrentStateVersion },
        outputs: { value: 1 },
        halt_if: { value: '' },
        halt_if_type: { value: 'str' },
        halt_if_compare: { value: 'is' },
        override_topic: { value: false },
        entity_id: { value: '' },
        state_type: { value: 'str' },
        state_location: { value: 'payload' },
        override_payload: { value: 'msg' }, // state location type
        entity_location: { value: 'data' },
        override_data: { value: 'msg' }, // entity location types
        blockInputOverrides: { value: false },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const $entityIdField = $('#node-input-entity_id');
        const $stateLocation = $('#node-input-state_location');
        const $entityLocation = $('#node-input-entity_location');

        const node = this;

        haServer.init(node, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            node.availableEntities = entities;

            $entityIdField.autocomplete({
                source: node.availableEntities,
                minLength: 0,
            });
        });

        const NoneType = { value: 'none', label: 'None', hasValue: false };
        $stateLocation.typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-override_payload',
        });
        $entityLocation.typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-override_data',
        });

        ifState.init(
            '#node-input-halt_if',
            '#node-input-halt_if_compare',
            'currentState'
        );
    },
    oneditsave: function () {
        const outputs = $('#node-input-halt_if').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
    },
});
