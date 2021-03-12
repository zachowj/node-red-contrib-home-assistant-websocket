/* global RED: false, $: false, ha: false, haServer: false, ifState: false, nodeVersion: false, haOutputs: false */
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
        entity_id: { value: '' },
        state_type: { value: 'str' },
        blockInputOverrides: { value: false },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'data',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entity',
                },
            ],
            validate: haOutputs.validate,
        },

        // deprecated but needed in config for old imports to work
        override_topic: { value: false },
        state_location: { value: 'payload' },
        override_payload: { value: 'msg' }, // state location type
        entity_location: { value: 'data' },
        override_data: { value: 'msg' }, // entity location types
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const $entityIdField = $('#node-input-entity_id');

        haServer.init(this, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            this.availableEntities = entities;

            $entityIdField.autocomplete({
                source: this.availableEntities,
                minLength: 0,
            });
        });

        ifState.init(
            '#node-input-halt_if',
            '#node-input-halt_if_compare',
            'currentState'
        );

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entity', 'entityId', 'entityState'],
        });
    },
    oneditsave: function () {
        const outputs = $('#node-input-halt_if').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.outputProperties = haOutputs.getOutputs();
    },
});
