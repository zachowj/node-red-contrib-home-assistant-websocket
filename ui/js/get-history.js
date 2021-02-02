/* global RED: false, $: false, ha: false, haServer: false, nodeVersion: false */
RED.nodes.registerType('api-get-history', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-get-history.svg',
    paletteLabel: 'get history',
    label: function () {
        if (this.name) {
            return this.name;
        }
        if (this.useRelativeTime && this.relativeTime) {
            return this.relativeTime;
        } else if (this.startdate) {
            const startdate = new Date(this.startdate);
            return `${startdate.toLocaleDateString()} ${startdate.toLocaleTimeString()}`;
        }
        return 'get history';
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        startdate: { value: '' },
        enddate: { value: '' },
        entityid: { value: '' },
        entityidtype: { value: '' },
        useRelativeTime: { value: false },
        relativeTime: { value: '' },
        flatten: { value: true },
        output_type: { value: 'array' },
        output_location_type: { value: 'msg' },
        output_location: { value: 'payload' },
    },
    oneditprepare: function () {
        const NODE = this;
        const $entityIdField = $('#entity_id');
        $entityIdField.val(this.entityid);
        NODE.entityidtype = NODE.entityidtype || 'is';
        $('#node-input-entityidtype').val(NODE.entityidtype);

        haServer.init(NODE, '#node-input-server');
        let availableEntities = [];
        haServer.autocomplete('entities', (entities) => {
            availableEntities = entities;

            $entityIdField.autocomplete({
                source: availableEntities,
                minLength: 0,
            });
        });

        $('#node-input-useRelativeTime').on('change', function () {
            if (this.checked) {
                $('.relative_row').show();
                $('.date_row').hide();
            } else {
                $('.relative_row').hide();
                $('.date_row').show();
            }
        });

        if (this.output_location === undefined) {
            $('#node-input-output_location').val('payload');
        }
        if (this.output_type === undefined) {
            $('#node-input-output_type').val('array');
        }

        $('#node-input-output_location').typedInput({
            types: ['msg', 'flow', 'global'],
            typeField: '#node-input-output_location_type',
        });

        $('#node-input-output_type')
            .on('change', (e) =>
                $('.output-option').toggle(e.target.value === 'array')
            )
            .trigger('change');
    },
    oneditsave: function () {
        this.entityid = $('#entity_id').val().trim();
    },
});
