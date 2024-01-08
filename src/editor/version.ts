import { EditorNodeInstance, EditorRED } from 'node-red';

import { NodeType } from '../const';
import { migrate } from '../helpers/migrate';
import {
    convertEntityNode,
    convertEventNode,
    EntityProperties,
} from './convert-entity';
import { i18n } from './i18n';
import { HassNodeProperties } from './types';

type NodeCallback = (n: object) => boolean;

declare const RED: EditorRED;
let $upgradeHaNode: JQuery<HTMLElement>;

export function versionCheck() {
    const selection = RED.view.selection();
    const node = selection
        ?.nodes?.[0] as EditorNodeInstance<HassNodeProperties>;
    if (node && isHomeAssistantNode(node) && !isCurrentVersion(node)) {
        migrateNode(node);
        RED.nodes.dirty(true);
        RED.notify(i18n('home-assistant.ui.migrations.node_schema_updated'));
    }
}

// This is used when nodes are opened in the editor from sources other than the workspace
// e.g. search results, configuration list
export function versionCheckOnEditPrepare(
    node: EditorNodeInstance<HassNodeProperties>,
) {
    if (!isHomeAssistantNode(node) || isCurrentVersion(node)) return;

    node = migrateNode(node);

    // the close event will not fire if the editor was already opened
    if (!isHomeAssistantConfigNode(node)) {
        RED.events.on('editor:close', function reopen() {
            RED.events.off('editor:close', reopen);
            RED.editor.edit(node);
        });
    }

    RED.nodes.dirty(true);
    RED.tray.close();
    RED.notify(i18n('home-assistant.ui.migrations.node_schema_updated'));
}

const exposedEventNodes: NodeType[] = [
    NodeType.Device,
    NodeType.EventsAll,
    NodeType.EventsState,
    NodeType.PollState,
    NodeType.Tag,
    NodeType.Time,
    NodeType.Zone,
];

function migrateNode(node: EditorNodeInstance<HassNodeProperties>) {
    const data = RED.nodes.convertNode(node, false) as HassNodeProperties;

    // TODO: Remove for version 1.0
    const haConfig =
        exposedEventNodes.includes(node.type as unknown as NodeType) &&
        (node.exposeToHomeAssistant === true ||
            (node.type === NodeType.Device && node.version < 1))
            ? data.haConfig
            : undefined;

    const migratedData: HassNodeProperties = migrate(data);

    // TODO: Remove for version 1.0
    if (migratedData.type === NodeType.Entity) {
        convertEntityNode(migratedData as unknown as EntityProperties);
    } else if (haConfig) {
        convertEventNode(migratedData as unknown as EntityProperties, haConfig);
    }

    let key: keyof HassNodeProperties;
    for (key in migratedData) {
        if (migratedData[key] === undefined) {
            // remove deprecated properties
            delete node[key];
        } else {
            // @ts-expect-error - DefinitelyTyped has properties marked as never
            node[key] = migratedData[key];
        }
    }

    // @ts-expect-error - DefinitelyTyped incorrectly defines the property
    node.changed = true;
    RED.editor.updateNodeProperties(node);
    const $upgradeHaNode = $('#upgrade-ha-node');
    if ($upgradeHaNode.is(':visible') && getOldNodeCount() === 0) {
        $upgradeHaNode.hide();
    }

    return node;
}

function migrateAllNodes() {
    // Get all nodes then iterate over them to avoid stopping if one is removed
    const nodes: EditorNodeInstance<HassNodeProperties>[] = [];
    const checkMigrate = (node: EditorNodeInstance<HassNodeProperties>) => {
        if (isHomeAssistantNode(node) && !isCurrentVersion(node)) {
            nodes.push(node);
        }
    };
    RED.nodes.eachNode(checkMigrate as NodeCallback);
    RED.nodes.eachConfig(checkMigrate as NodeCallback);
    nodes.forEach((n) => migrateNode(n));
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

// Turn string into camel case and append the string 'Version'
function capitalizeNodeType(type: string) {
    const str = type
        .split('-')
        .reduce(
            (acc: string[], cur, index) =>
                acc.concat(
                    `${index ? cur[0].toUpperCase() : cur[0]}${cur.slice(1)}`,
                ),
            [],
        )
        .join('');

    return `${str}Version`;
}

export function isCurrentVersion(node: EditorNodeInstance<HassNodeProperties>) {
    const currentVersion = RED.settings.get<number>(
        capitalizeNodeType(node.type as unknown as string),
        -1,
    );

    // coonfig nodes don't have default vaules set yet at this point
    const nodeVersion =
        isHomeAssistantConfigNode(node) && node.version === undefined
            ? // @ts-expect-error - Use a private property to get the version before the node is initialized
              node._def.defaults.version.value
            : node.version;

    return nodeVersion !== undefined && nodeVersion >= currentVersion;
}

export function isHomeAssistantNode(
    node: EditorNodeInstance<HassNodeProperties>,
) {
    const nodeSet = RED.nodes.registry.getNodeSetForType(
        node.type as unknown as string,
    ) as { module?: string } | undefined;
    return nodeSet?.module === 'node-red-contrib-home-assistant-websocket';
}

function isHomeAssistantConfigNode(
    node: EditorNodeInstance<HassNodeProperties>,
) {
    return (
        node?.type &&
        [
            NodeType.Server,
            NodeType.EntityConfig,
            NodeType.DeviceConfig,
        ].includes(node.type)
    );
}

export function getOldNodeCount() {
    let count = 0;
    const addToCount = (n: EditorNodeInstance<HassNodeProperties>) => {
        if (isHomeAssistantNode(n) && !isCurrentVersion(n)) {
            count++;
        }
    };
    RED.nodes.eachNode(addToCount as NodeCallback);
    RED.nodes.eachConfig(addToCount as NodeCallback);

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

export function onNodesRemove(node: EditorNodeInstance<HassNodeProperties>) {
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
        </div>`,
    );
    const $buttonHtml = $.parseHTML(
        `<li><button id="upgrade-ha-node"><i class="fa fa-refresh"></i> ${buttonLabel}</button></li>`,
    );
    $('body').append($dialogHtml);
    $('#red-ui-header .red-ui-header-toolbar').prepend($buttonHtml);
}
