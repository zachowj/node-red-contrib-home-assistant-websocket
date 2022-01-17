import { EditorNodeInstance, EditorRED } from 'node-red';

import { migrate as m } from '../helpers/migrate';
import { i18n } from './i18n';
import { HassNodeProperties } from './types';

declare const RED: EditorRED;
let $upgradeHaNode: JQuery<HTMLElement>;

export function check(node: EditorNodeInstance<HassNodeProperties>) {
    if (isCurrentVersion(node)) {
        return;
    }
    migrateNode(node);
}

function migrate(node: any) {
    const data = RED.nodes.convertNode(node, false);

    const migratedData = m(data);

    for (const key in migratedData) {
        if (migratedData[key] === undefined) {
            // remove deprecated properties
            delete migratedData[key];
        } else {
            node[key] = migratedData[key];
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
        if (
            isHomeAssistantNode(node as EditorNodeInstance) &&
            !isCurrentVersion(node as EditorNodeInstance<HassNodeProperties>)
        ) {
            migrate(node);
        }

        return true;
    });
    RED.nodes.eachConfig((node) => {
        if (
            isHomeAssistantNode(node as EditorNodeInstance) &&
            !isCurrentVersion(node as EditorNodeInstance<HassNodeProperties>)
        ) {
            migrate(node);
        }
        return true;
    });
    RED.nodes.dirty(true);
    RED.notify(i18n('home-assistant.ui.migrations.all_nodes_updated'));
    RED.view.redraw();
}

export function migrateAllNodesConfirm() {
    const namespace = 'home-assistant.ui.migrations';
    const ok = i18n(`${namespace}.button_ok`);
    const cancel = i18n(`${namespace}.button_cancel`);
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

function migrateNode(node: EditorNodeInstance<HassNodeProperties>) {
    migrate(node);
    RED.events.on('editor:close', function reopen() {
        RED.events.off('editor:close', reopen);
        RED.editor.edit(node);
    });
    RED.nodes.dirty(true);
    RED.tray.close();
    RED.notify(i18n('home-assistant.ui.migrations.node_schema_updated'));
}

// Turn string into camel case and append the string 'Version'
function capitalizeNodeType(type: string) {
    const str = type
        .split('-')
        .reduce(
            (acc: string[], cur, index) =>
                acc.concat(
                    `${index ? cur[0].toUpperCase() : cur[0]}${cur.slice(1)}`
                ),
            []
        )
        .join('');

    return `${str}Version`;
}

export function isCurrentVersion(node: EditorNodeInstance<HassNodeProperties>) {
    const version = RED.settings.get<number>(
        capitalizeNodeType(node.type as unknown as string),
        -1
    );

    return node.version !== undefined && node.version >= version;
}

export function isHomeAssistantNode(node: EditorNodeInstance) {
    const nodeSet = RED.nodes.registry.getNodeSetForType(
        node.type as unknown as string
    ) as { module?: string } | undefined;
    return nodeSet?.module === 'node-red-contrib-home-assistant-websocket';
}

export function getOldNodeCount() {
    let count = 0;
    RED.nodes.eachNode((n) => {
        if (
            isHomeAssistantNode(n as EditorNodeInstance) &&
            !isCurrentVersion(n as EditorNodeInstance<HassNodeProperties>)
        ) {
            count++;
        }
        return true;
    });
    RED.nodes.eachConfig((n) => {
        if (
            isHomeAssistantNode(n as EditorNodeInstance) &&
            !isCurrentVersion(n as EditorNodeInstance<HassNodeProperties>)
        ) {
            count++;
        }
        return true;
    });

    return count;
}

export function setupMigrations() {
    createElements();
    $upgradeHaNode = $('#upgrade-ha-node');
    $upgradeHaNode.hide();
    $upgradeHaNode.on('click', migrateAllNodesConfirm);
}

export function onNodesAdd(node: EditorNodeInstance<HassNodeProperties>) {
    if (isHomeAssistantNode(node) && !isCurrentVersion(node)) {
        $upgradeHaNode.show();
    }
}

export function onNodesRemove(node: EditorNodeInstance) {
    if (
        $upgradeHaNode.is(':visible') &&
        isHomeAssistantNode(node) &&
        getOldNodeCount() === 0
    ) {
        $upgradeHaNode.hide();
    }
}

function createElements() {
    const namespace = 'home-assistant.ui.migrations';
    const title = i18n(`${namespace}.title`);
    const warning = i18n(`${namespace}.warning`);
    const message = i18n(`${namespace}.message`);
    const buttonLabel = i18n(`${namespace}.button_label`);
    const attention = i18n('home-assistant.ui.notifications.attention');

    const $dialogHtml = $.parseHTML(
        `<div id="ha-dialog-confirm" title="${title}">
            ${message}
            <div class="ui-state-error ha-alert-box"><strong>${attention}:</strong> ${warning}</div>
        </div>`
    );
    const $buttonHtml = $.parseHTML(
        `<li><button id="upgrade-ha-node"><i class="fa fa-refresh"></i> ${buttonLabel}</button></li>`
    );
    $('body').append($dialogHtml);
    $('#red-ui-header .red-ui-header-toolbar').prepend($buttonHtml);
}
