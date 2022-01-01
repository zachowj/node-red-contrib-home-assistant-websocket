/* globals haUtils: false */
// eslint-disable-next-line no-unused-vars
const exposeNode = (function ($, RED, ha) {
    let node;
    const version = {};

    RED.comms.subscribe('homeassistant/integration/#', (topic, msg) => {
        const parts = topic.split('/');
        const serverId = parts[2];
        version[serverId] = msg.version;
    });

    function isEntityNode() {
        return node.type === 'ha-button';
    }

    function getServerId() {
        let selectedServer = $('#node-input-server').val();
        if (isEntityNode()) {
            const entity = RED.nodes.node($('#node-input-entityConfig').val());
            selectedServer = entity && entity.server;
        }

        if (!selectedServer || selectedServer === '_ADD_') {
            return;
        }

        return selectedServer;
    }

    function getIntegrationVersion() {
        const serverId = getServerId();

        if (version[serverId] && version[serverId] !== 0) {
            return version[serverId];
        }

        return '0';
    }

    function isIntegrationLoaded() {
        const serverId = getServerId();

        if (version[serverId] && version[serverId] !== 0) {
            return true;
        }

        return false;
    }

    function init(n) {
        node = n;
        render();

        $('#node-input-server, #node-input-entityConfig').on('change', () => {
            switch (node.type) {
                case 'ha-webhook':
                case 'ha-entity':
                    renderAlert();
                    break;
                case 'ha-button':
                    renderAlert('1.0.4');
                    break;
                case 'ha-device':
                    renderAlert('0.5.0');
                    break;
                default:
                    toggleExpose();
                    break;
            }
        });
    }

    function render() {
        switch (node.type) {
            case 'ha-webhook':
            case 'ha-entity':
                renderAlert();
                break;
            case 'ha-button':
                renderAlert('1.0.4');
                break;
            default:
                renderEventNode();
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
                    const $label = $('<label>').appendTo($row);
                    $('<span>')
                        .text(data.property.replace(/_/g, ' '))
                        .appendTo($label);

                    $('<input />', {
                        type: 'hidden',
                        name: 'property',
                        value: data.property,
                    }).appendTo($label);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($label);
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

    function renderAlert(minVersion) {
        const satisfiesVersion =
            minVersion === undefined ||
            haUtils.compareVersion(minVersion, getIntegrationVersion());
        const integartionValid = isIntegrationLoaded() && satisfiesVersion;
        if (!$('#integrationAlert').length) {
            const alertText = `
            <div id="integrationAlert" class="ui-state-error ha-alert-box">
                <strong>Attention:</strong> 
                This node requires <a href="https://github.com/zachowj/hass-node-red" target="_blank">Node-RED custom integration ${
                    satisfiesVersion ? '' : `version ${minVersion}+`
                } <i class="fa fa-external-link external-link"></i></a> to be installed in Home Assistant for it to function.
            </div>`;
            $('#dialog-form').prepend(alertText);
        }
        $('#integrationAlert').toggle(!integartionValid);
    }

    function toggleExpose() {
        if (!isIntegrationLoaded()) {
            $('#node-input-exposeToHomeAssistant')
                .prop('checked', false)
                .trigger('change');
        }
        $('#exposeToHa').toggle(isIntegrationLoaded());
    }

    return {
        getValues,
        init,
        isIntegrationLoaded,
    };
    // eslint-disable-next-line no-undef
})(jQuery, RED);
