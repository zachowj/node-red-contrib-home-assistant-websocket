RED.nodes.registerType('poll-state', {
    category: 'home_assistant',
    color: '#399CDF',
    inputs: 0,
    outputs: 1,
    outputLabels: nodeVersion.ifStateLabels,
    icon: 'ha-poll-state.svg',
    paletteLabel: 'poll state',
    label: function () {
        return this.name || `poll state: ${this.entity_id}`;
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
        const $entityIdField = $('#entity_id');
        $entityIdField.val(this.entity_id);

        const node = this;

        haServer.init(node, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            node.availableEntities = entities;

            $entityIdField.autocomplete({
                source: node.availableEntities,
                minLength: 0,
                change: (evt, ui) => {
                    const validSelection =
                        node.availableEntities.indexOf($(evt.target).val()) >
                        -1;
                    if (validSelection) {
                        $(evt.target).removeClass('input-error');
                    } else {
                        $(evt.target).addClass('input-error');
                    }
                },
            });

            const validSelection =
                node.availableEntities.indexOf(node.entity_id) > -1;
            if (validSelection) {
                $entityIdField.removeClass('input-error');
            } else {
                $entityIdField.addClass('input-error');
            }
        });

        $('#node-input-updateinterval').spinner({ min: 1 });

        if (this.state_type === undefined) {
            $('#node-input-state_type').val('str');
        }

        if (this.halt_if_compare === undefined) {
            $('#node-input-halt_if_compare').val('is');
        }

        if (this.updateIntervalUnits === undefined) {
            $('#node-input-updateIntervalUnits').val('seconds');
        }

        ifState.init('#node-input-halt_if', '#node-input-halt_if_compare');
        exposeNode.init(node);
    },
    oneditsave: function () {
        this.entity_id = $('#entity_id').val().trim();
        let outputs = $('#node-input-halt_if').val() ? 2 : 1;
        // Swap inputs for the new 'if state' location
        if (this.version === 0 && outputs === 2) {
            outputs = JSON.stringify({ 0: 1, 1: 0 });
        }
        $('#node-input-outputs').val(outputs);
        nodeVersion.update(this);
        this.haConfig = exposeNode.getValues();
    },
});
