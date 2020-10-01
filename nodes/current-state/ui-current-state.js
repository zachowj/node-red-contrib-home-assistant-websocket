RED.nodes.registerType('api-current-state', {
    category: 'home_assistant',
    color: '#52C0F2',
    inputs: 1,
    outputs: 1,
    outputLabels: nodeVersion.ifStateLabels,
    icon: 'ha-current-state.svg',
    paletteLabel: 'current state',
    label: function () {
        return this.name || `current_state: ${this.entity_id}`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: 1 },
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

        const $entityIdField = $('#entity_id');
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

        $entityIdField.val(node.entity_id);

        // Handle backwards compatibility
        if (node.state_location === undefined) {
            $stateLocation.val('payload');
            $('#node-input-override_payload').val(
                node.override_payload === false ? 'none' : 'msg'
            );
        }
        if (node.entity_location === undefined) {
            $entityLocation.val('data');
            $('#node-input-override_data').val(
                node.override_data === false ? 'none' : 'msg'
            );
        }

        const NoneType = { value: 'none', label: 'None', hasValue: false };
        $stateLocation.typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-override_payload',
        });
        $entityLocation.typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-override_data',
        });

        if (node.state_type === undefined) {
            $('#node-input-state_type').val('str');
        }

        if (node.halt_if_compare === undefined) {
            $('#node-input-halt_if_compare').val('is');
        }

        ifState.init(
            '#node-input-halt_if',
            '#node-input-halt_if_compare',
            'currentState'
        );
    },
    oneditsave: function () {
        this.entity_id = $('#entity_id').val();
        let outputs = $('#node-input-halt_if').val() ? 2 : 1;
        // Swap inputs for the new 'if state' location
        if (this.version === 0 && outputs === 2) {
            outputs = JSON.stringify({ 0: 1, 1: 0 });
        }
        $('#node-input-outputs').val(outputs);
        nodeVersion.update(this);
    },
});
