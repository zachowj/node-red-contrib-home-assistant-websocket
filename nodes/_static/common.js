// eslint-disable-next-line no-unused-vars
var nodeVersion = (function($) {
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
                name = 'events-state-changed';
                break;
        }
        return `https://github.com/zachowj/node-red-contrib-home-assistant-websocket/wiki/${name}`;
    }

    function check(node) {
        node.version = node.version === undefined ? 0 : Number(node.version);
        const versionAlert = `<div id="versionUpdate" class="ui-state-error ha-alertBox"><p><strong>Alert:</strong>This node will be updated to version ${
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
                ? 'ha-nodeLabelLegacy '
                : ''
        }${this.name ? 'node_label_italic' : ''}`;
    }

    return {
        check,
        ifStateLabels,
        labelStyle,
        update
    };
    // eslint-disable-next-line no-undef
})(jQuery);

// eslint-disable-next-line no-unused-vars
var haServer = (function($, RED) {
    let $server;
    let serverId;
    let node;

    function setDefault() {
        let defaultServer;
        RED.nodes.eachConfig(n => {
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
            .done(items => {
                callback(items);
            })
            .fail(err => {
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
        autocomplete
    };

    // eslint-disable-next-line no-undef
})(jQuery, RED);

// eslint-disable-next-line no-unused-vars
var exposeNode = (function($) {
    function render(node) {
        const $row = $('<div />', {
            class: `form-row checkboxOption${
                node.type === 'trigger-state' ? 'Left' : ''
            }`
        });
        $('<input />', {
            type: 'checkbox',
            id: 'node-input-exposeToHomeAssistant',
            checked: node.exposeToHomeAssistant
        })
            .on('change', function() {
                $('#haConfigRow').toggle(
                    $('#node-input-exposeToHomeAssistant').is(':checked') ===
                        true
                );
            })
            .appendTo($row);
        $('<label />', {
            for: 'node-input-exposeToHomeAssistant',
            text: 'Expose to Home Assistant'
        }).appendTo($row);
        const $configRow = $('<div />', {
            class: 'form-row',
            id: 'haConfigRow'
        });
        const $configList = $('<ol />', { id: 'haConfig' }).appendTo(
            $configRow
        );

        $configList
            .editableList({
                addButton: false,
                header: $('<div>Home Assistant Config (optional)</div>'),
                addItem: function(container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        value: data.property,
                        style: 'width: 40%;',
                        readonly: true
                    }).appendTo($row);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                        style: 'margin-left: 10px;width: 55%;'
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row);
                }
            })
            .editableList('addItems', node.haConfig);

        $('#dialog-form')
            .append($row)
            .append($configRow);
    }

    function getValues() {
        const arr = [];
        $('#haConfig')
            .editableList('items')
            .each(function(i) {
                const $row = $(this);
                arr.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').val()
                });
            });

        return arr;
    }
    return {
        render,
        getValues
    };
    // eslint-disable-next-line no-undef
})(jQuery);
