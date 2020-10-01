RED.nodes.registerType('ha-wait-until', {
    category: 'home_assistant',
    color: '#52C0F2',
    inputs: 1,
    outputs: 1,
    outputLabels: ['', 'timed out'],
    icon: 'ha-wait-until.svg',
    paletteLabel: 'wait until',
    label: function () {
        return this.name || `wait until`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        outputs: { value: 1 },
        entityId: { value: '' },
        entityIdFilterType: { value: 'exact' },
        property: { value: '' },
        comparator: { value: 'is' },
        value: { value: '' },
        valueType: { value: 'str' },
        timeout: { value: 0 },
        timeoutType: { value: 'num' },
        timeoutUnits: { value: 'seconds' },
        entityLocation: { value: 'data' },
        entityLocationType: { value: 'none' },
        checkCurrentState: { value: true },
        blockInputOverrides: { value: true },
    },
    oneditprepare: function () {
        const node = this;

        haServer.init(node, '#node-input-server');
        let availableEntities = [];
        let availableProperties = [];
        haServer.autocomplete('entities', (entities) => {
            availableEntities = entities;
            $('#node-input-entityId').autocomplete({
                source: availableEntities,
                minLength: 0,
            });
        });
        haServer.autocomplete('properties', (properties) => {
            availableProperties = properties;
            $('#node-input-property').autocomplete({
                source: availableProperties,
                minLength: 0,
            });
        });

        if (node.checkCurrentState === undefined) {
            $('#node-input-checkCurrentState').prop('checked', false);
        }

        const entityType = { value: 'entity', label: 'entity.' };
        const defaultTypes = [
            'str',
            'num',
            'bool',
            're',
            'jsonata',
            'msg',
            'flow',
            'global',
            entityType,
        ];
        $('#node-input-value').typedInput({
            default: 'str',
            types: defaultTypes,
            typeField: '#node-input-valueType',
        });

        $('#node-input-comparator').change(function (e) {
            let types = defaultTypes;

            $('#node-input-property').prop(
                'disabled',
                e.target.value === 'jsonata'
            );

            switch (e.target.value) {
                case 'is':
                case 'is_not':
                    break;
                case 'lt':
                case 'lte':
                case 'gt':
                case 'gte':
                    types = [
                        'num',
                        'jsonata',
                        'msg',
                        'flow',
                        'global',
                        entityType,
                    ];
                    break;
                case 'includes':
                case 'does_not_include':
                    types = ['str', 'jsonata', 'msg', 'flow', 'global'];
                    break;
                case 'jsonata':
                    types = ['jsonata'];
                    break;
            }
            $('#node-input-value').typedInput('types', types);
        });

        $('#node-input-timeout')
            .typedInput({
                default: 'num',
                types: ['num', 'jsonata'],
                typeField: '#node-input-timeoutType',
            })
            .on('change', function (_, timeoutType) {
                if (timeoutType === true) return;

                node.outputs =
                    timeoutType === 'jsonata' ||
                    (timeoutType === 'num' && this.value > 0)
                        ? 2
                        : 1;
            });

        const NoneType = { value: 'none', label: 'None', hasValue: false };
        $('#node-input-entityLocation').typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-entityLocationType',
        });

        // Set defaults if undefined
        if (node.blockInputOverrides === undefined) {
            $('#node-input-blockInputOverrides').prop('checked', true);
        }
        const $filterType = $('#node-input-entityIdFilterType');
        $filterType.val(node.entityIdFilterType || 'exact');
        $filterType.on('change', function () {
            $('.exact-only').toggle($filterType.val() === 'exact');
        });
    },
});
