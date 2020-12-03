// eslint-disable-next-line no-unused-vars, no-var
var exposeNode = (function ($) {
    let node;

    function getServerId() {
        const selectedServer = $('#node-input-server').val();

        if (!selectedServer || selectedServer === '_ADD_') {
            return;
        }

        return selectedServer;
    }

    function getVersion(callback) {
        if (!getServerId()) {
            callback(node);
            return;
        }

        $.getJSON(
            `homeassistant/${getServerId()}/version?_=${Date.now()}`
        ).done((data) => {
            node.integrationVersion = data.version;
            if (callback) {
                callback(node);
            }
        });
    }

    function init(n) {
        node = n;
        render();
        const callback = getCallback();

        $('#node-input-server').on('change', () => getVersion(callback));
    }

    function render() {
        switch (node.type) {
            case 'ha-webhook':
            case 'ha-entity':
                renderAlert();
                break;
            default:
                renderEventNode();
        }
    }

    function getCallback() {
        switch (node.type) {
            case 'ha-webhook':
            case 'ha-entity':
                return renderAlert;
            default:
                return toggleExpose;
        }
    }
    function renderEventNode() {
        const $row = $('<div />', {
            id: 'exposeToHa',
            class: `form-row checkbox-option${
                node.type === 'trigger-state' ? '-left' : ''
            }`,
        });
        $('<input />', {
            type: 'checkbox',
            id: 'node-input-exposeToHomeAssistant',
            checked: node.exposeToHomeAssistant,
        })
            .on('change', function () {
                $('#haConfigRow').toggle(
                    $('#node-input-exposeToHomeAssistant').is(':checked') ===
                        true
                );
            })
            .appendTo($row);
        $('<label />', {
            for: 'node-input-exposeToHomeAssistant',
            text: 'Expose to Home Assistant',
        }).appendTo($row);
        const $configRow = $('<div />', {
            class: 'form-row',
            id: 'haConfigRow',
        });
        const $configList = $('<ol />', { id: 'haConfig' }).appendTo(
            $configRow
        );

        // set default for nodes created before exposeToHomeAssistant was aded
        const haConfig = node.haConfig || [
            { property: 'name', value: '' },
            { property: 'icon', value: '' },
        ];
        $configList
            .editableList({
                addButton: false,
                header: $('<div>Home Assistant Config (optional)</div>'),
                addItem: function (container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        value: data.property,
                        style: 'width: 40%;',
                        readonly: true,
                    }).appendTo($row);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                        style: 'margin-left: 10px;width: 55%;',
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row);
                },
            })
            .editableList('addItems', haConfig);

        $('#dialog-form').append($row).append($configRow);
        $('#node-input-exposeToHomeAssistant').trigger('change');
    }

    function getValues() {
        const arr = [];
        $('#haConfig')
            .editableList('items')
            .each(function (i) {
                const $row = $(this);
                arr.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').val(),
                });
            });

        return arr;
    }

    function renderAlert() {
        if (!$('#integrationAlert').length) {
            const alertText =
                '<div id="integrationAlert" class="ui-state-error ha-alert-box"><strong>Attention:</strong> This node requires <a href="https://github.com/zachowj/hass-node-red" target="_blank">Node-RED custom integration <i class="fa fa-external-link external-link"></i></a> to be installed in Home Assistant for it to function.</strong></div>';
            $('#dialog-form').prepend(alertText);
        }
        $('#integrationAlert').toggle(node.integrationVersion === 0);
    }

    function toggleExpose() {
        if (node.integrationVersion === 0) {
            $('#node-input-exposeToHomeAssistant')
                .prop('checked', false)
                .trigger('change');
        }
        $('#exposeToHa').toggle(node.integrationVersion !== 0);
    }

    return {
        init,
        getValues,
    };
    // eslint-disable-next-line no-undef
})(jQuery);
