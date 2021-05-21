/* global ha: false */
// eslint-disable-next-line no-unused-vars
const nodeVersion = (function ($, RED, haMigrations) {
    function check(node) {
        if (isCurrentVersion(node)) {
            return;
        }

        migrateNode(node);
    }

    function migrate(node) {
        const data = { type: node.type };
        const ignoreProperties = [
            'x',
            'y',
            'z',
            'd',
            'g',
            'l',
            'id',
            'type',
            'wires',
            'inputs',
            'outputs',
        ];
        for (const property in node._config) {
            if (
                !ignoreProperties.includes(property) &&
                Object.prototype.hasOwnProperty.call(node._config, property)
            ) {
                data[property] = node[property];
            }
        }

        const migratedData = haMigrations.migrate(data);
        delete migratedData.type;

        for (const property in migratedData) {
            if (
                node._def.defaults[property] &&
                node._def.defaults[property].value === undefined
            ) {
                // delete deprecated properties
                delete node[property];
            } else {
                node[property] = migratedData[property];
            }
        }

        node.dirty = true;
        node.changed = true;
        const $upgradeHaNode = $('#upgrade-ha-node');
        if ($upgradeHaNode.is(':visible') && getOldNodeCount() === 0) {
            $upgradeHaNode.hide();
        }
    }

    function migrateAllNodes() {
        RED.nodes.eachNode((node) => {
            if (isHomeAssistantNode(node) && !isCurrentVersion(node)) {
                migrate(node);
            }
        });
        RED.nodes.eachConfig((node) => {
            if (isHomeAssistantNode(node) && !isCurrentVersion(node)) {
                migrate(node);
            }
        });
        RED.nodes.dirty(true);
        RED.notify(ha.i18n('home-assistant.ui.migrations.all_nodes_updated'));
        RED.view.redraw();
    }

    function migrateAllNodesConfirm() {
        const namespace = 'home-assistant.ui.migrations';
        const ok = ha.i18n(`${namespace}.button_ok`);
        const cancel = ha.i18n(`${namespace}.button_cancel`);
        $('#ha-dialog-confirm').dialog({
            resizable: false,
            height: 'auto',
            width: 400,
            modal: true,
            buttons: {
                [ok]: function () {
                    $(this).dialog('close');
                    migrateAllNodes();
                },
                [cancel]: function () {
                    $(this).dialog('close');
                },
            },
        });
    }

    function migrateNode(node) {
        migrate(node);
        RED.nodes.dirty(true);

        RED.events.on('editor:close', function reopen() {
            RED.events.off('editor:close', reopen);
            RED.editor.edit(node);
        });

        RED.tray.close();
        RED.notify(ha.i18n('home-assistant.ui.migrations.node_schema_updated'));
    }

    function isCurrentVersion(node) {
        return (
            node.version !== undefined &&
            node.version >= node._def.defaults.version.value
        );
    }

    function isHomeAssistantNode(node) {
        return (
            node._def.set.module === 'node-red-contrib-home-assistant-websocket'
        );
    }

    function getOldNodeCount() {
        let count = 0;
        RED.nodes.eachNode((n) => {
            if (isHomeAssistantNode(n) && !isCurrentVersion(n)) {
                count++;
            }
        });
        RED.nodes.eachConfig((n) => {
            if (isHomeAssistantNode(n) && !isCurrentVersion(n)) {
                count++;
            }
        });

        return count;
    }

    return {
        check,
        isCurrentVersion,
        isHomeAssistantNode,
        migrateAllNodesConfirm,
        getOldNodeCount,
    };
    // eslint-disable-next-line no-undef
})(jQuery, RED, haMigrations);
