// eslint-disable-next-line no-unused-vars
var nodeVersion = (function ($) {
    function wikiLink(type) {
        let name = '';

        switch (type) {
            case 'api-current-state':
                name = 'current-state';
                break;
            case 'api-call-service':
                name = 'call-service';
                break;
            case 'poll-state':
                name = 'poll-state';
                break;
            case 'server-state-changed':
                name = 'events-state';
                break;
        }
        return `https://zachowj.github.io/node-red-contrib-home-assistant-websocket/node/${name}.html#changelog`;
    }

    function check(node) {
        node.version = node.version === undefined ? 0 : Number(node.version);
        const versionAlert = `<div id="version-update" class="ui-state-error ha-alert-box"><p><strong>Alert:</strong>This node will be updated to version ${
            node._def.defaults.version.value
        } from ${node.version} (<a href="${wikiLink(
            node.type
        )}#version" target="_blank" rel="noreferrer">changes</a>)</p></div>`;

        if (node.version < node._def.defaults.version.value) {
            $('#dialog-form').prepend(versionAlert);
        }
    }

    function update(node) {
        if (node.version < node._def.defaults.version.value) {
            $('#node-input-version').val(node._def.defaults.version.value);
        }
    }

    function ifStateLabels(index) {
        if (this.halt_if || this.haltifstate) {
            if (Number(this.version) === 0 || this.version === undefined) {
                if (index === 0) return "'If State' is false";
                if (index === 1) return "'If State' is true";
            }

            if (index === 0) return "'If State' is true";
            if (index === 1) return "'If State' is false";
        }
    }

    function labelStyle() {
        return `${
            this._def.defaults.version &&
            Number(this.version) !== this._def.defaults.version.value
                ? 'ha-node-label-legacy '
                : ''
        }${this.name ? 'node_label_italic' : ''}`;
    }

    return {
        check,
        ifStateLabels,
        labelStyle,
        update,
    };
    // eslint-disable-next-line no-undef
})(jQuery);

// eslint-disable-next-line no-unused-vars
var haServer = (function ($, RED) {
    let $server;
    let serverId;
    let node;

    function setDefault() {
        let defaultServer;
        RED.nodes.eachConfig((n) => {
            if (n.type === 'server' && !defaultServer) defaultServer = n.id;
        });
        if (defaultServer) $server.val(defaultServer);
    }

    function init(n, server) {
        $server = $(server);
        node = n;

        if (!node.server) {
            setDefault();
        }
    }

    function autocomplete(type, callback) {
        // If a server is selected populate drop downs
        const selectedServer = $server.val();
        if (node.server || (selectedServer && selectedServer !== '_ADD_')) {
            serverId = node.server || selectedServer;
            getItems(type, callback);
        }

        $server.change(() => {
            serverId = $server.val();
            getItems(type, callback);
        });
    }

    function getItems(type, callback) {
        // If no server added yet just return
        if (serverId === '_ADD_') return;

        $.getJSON(`homeassistant/${serverId}/${type}`)
            .done((items) => {
                callback(items);
            })
            .fail((err) => {
                const serverConfig = RED.nodes.node($server.val());

                if (serverConfig && serverConfig.dirty === true) {
                    RED.notify(
                        `You probably haven't deployed since adding a server. Do that for autocomplete to work.\n${err.responseText}`,
                        'error'
                    );
                }
            });
    }

    return {
        init,
        autocomplete,
    };

    // eslint-disable-next-line no-undef
})(jQuery, RED);

// eslint-disable-next-line no-unused-vars
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
