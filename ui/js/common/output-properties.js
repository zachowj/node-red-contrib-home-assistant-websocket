/* global jQuery: false, ha: false */
// eslint-disable-next-line no-unused-vars
const haOutputs = (function ($) {
    const customOutputElement = '#custom-outputs';
    let $outputs;
    let _extraTypes = [];

    const customTypes = {
        config: { value: 'config', label: 'config.', hasValue: true },
        deviceId: { value: 'triggerId', label: 'device id', hasValue: false },
        entity: { value: 'entity', label: 'entity', hasValue: false },
        entityId: { value: 'triggerId', label: 'entity id', hasValue: false },
        entityState: {
            value: 'entityState',
            label: 'entity state',
            hasValue: false,
        },
        eventData: { value: 'eventData', label: 'event data', hasValue: false },
        headers: { value: 'headers', label: 'headers', hasValue: false },
        params: { value: 'params', label: 'params', hasValue: false },
        prevEntity: {
            value: 'prevEntity',
            label: 'previous entity',
            hasValue: false,
        },
        results: { value: 'results', label: 'results', hasValue: false },
        receivedData: {
            value: 'data',
            label: 'received data',
            hasValue: false,
        },
        sentData: { value: 'data', label: 'sent data', hasValue: false },
        timeSinceChangedMs: {
            value: 'timeSinceChangedMs',
            label: 'timeSinceChangedMs',
            hasValue: false,
        },
        triggerId: { value: 'triggerId', label: 'trigger id', hasValue: false },
    };
    const defaultTypes = [
        customTypes.config,
        'flow',
        'global',
        'str',
        'num',
        'bool',
        'date',
        'jsonata',
    ];

    function createOutputs(
        properties = [],
        { element = customOutputElement, extraTypes = [] } = {}
    ) {
        $outputs = $(element);
        _extraTypes = extraTypes;

        $outputs.editableList({
            addButton: true,
            removable: true,
            sortable: true,
            height: 'auto',
            header: $('<div>').append(
                ha.i18n('home-assistant.label.output_properties')
            ),
            addItem: function (container, _, data) {
                container.css({
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                });
                const $row = $('<div />').appendTo(container);
                const propertyName = $('<input/>', {
                    class: 'property-name',
                    type: 'text',
                })
                    .css('width', '30%')
                    .appendTo($row)
                    .typedInput({ types: ['msg', 'flow', 'global'] });

                $('<div/>', { style: 'display:inline-block; padding:0px 6px;' })
                    .text('=')
                    .appendTo($row);

                const propertyValue = $('<input/>', {
                    class: 'property-value',
                    type: 'text',
                })
                    .css('width', 'calc(70% - 30px)')
                    .appendTo($row)
                    .typedInput({
                        default: 'str',
                        types: getTypes(),
                    });

                propertyName.typedInput('value', data.property);
                propertyName.typedInput('type', data.propertyType);

                propertyValue.typedInput('value', data.value);
                propertyValue.typedInput('type', data.valueType);
            },
        });
        $outputs.editableList('addItems', properties);
    }

    function getTypes() {
        let valueTypes = _extraTypes.reduce((acc, type) => {
            if (type in customTypes) return [...acc, customTypes[type]];

            return acc;
        }, []);

        valueTypes = [...valueTypes, ...defaultTypes];
        if (_extraTypes.includes('msg')) {
            const index = valueTypes.indexOf('flow');
            valueTypes.splice(index, 0, 'msg');
        }

        return valueTypes;
    }

    function getOutputs() {
        const outputList = $(customOutputElement).editableList('items');
        const outputs = [];
        outputList.each(function () {
            const $property = $(this).find('.property-name');
            const $value = $(this).find('.property-value');
            const property = $property.typedInput('value');
            const propertyType = $property.typedInput('type');
            const value = $value.typedInput('value');
            const valueType = $value.typedInput('type');
            outputs.push({
                property,
                propertyType,
                value,
                valueType,
            });
        });

        return outputs;
    }

    function empty() {
        $outputs.empty();
    }

    function loadData(data) {
        $outputs.editableList('empty').editableList('addItems', data);
    }

    function setTypes(types) {
        _extraTypes = types;
    }

    function validate(value) {
        return (
            value === undefined ||
            (Array.isArray(value) &&
                !value.some((output) => output.property.length === 0))
        );
    }

    return {
        empty,
        createOutputs,
        getOutputs,
        loadData,
        setTypes,
        validate,
    };
})(jQuery);
