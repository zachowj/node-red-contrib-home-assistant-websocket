import { EditorRED } from 'node-red';

import {
    COMPANION_MIN_VERSION_ENTITY_AVAILABLE,
    NO_VERSION,
    NodeType,
    ValueIntegrationMode,
} from '../const';
import { SentenceMode } from '../nodes/sentence/const';
import { HassExposedConfig, HassNodeProperties } from './types';
import * as haUtils from './utils';

declare const RED: EditorRED;

let node: HassNodeProperties;
const version: { [serverId: string]: string } = {};

export function updateIntegration(topic: string, msg: any) {
    const parts = topic.split('/');
    const serverId = parts[2];
    version[serverId] = msg.version;
}

function isEntityNode() {
    const nodes = [
        NodeType.BinarySensor,
        NodeType.Button,
        NodeType.Number,
        NodeType.Select,
        NodeType.Sensor,
        NodeType.Switch,
        NodeType.Text,
        NodeType.TimeEntity,
    ];
    return (
        'type' in node && node?.type && nodes.includes(node.type as NodeType)
    );
}

function getServerId(editorNode?: {
    entityConfig?: string;
    server?: string;
}): string | undefined {
    // Prefer live edit-dialog fields when present
    let selectedServer = $('#node-input-server').val() as string | undefined;
    const entityConfigFromDialog = $('#node-input-entityConfig').val() as
        string | undefined;

    if (entityConfigFromDialog && entityConfigFromDialog !== '_ADD_') {
        const entity = RED.nodes.node(entityConfigFromDialog) as
            Record<string, any> | undefined;
        selectedServer = entity?.server;
    } else if (editorNode?.entityConfig) {
        const entity = RED.nodes.node(editorNode.entityConfig) as
            Record<string, any> | undefined;
        selectedServer = entity?.server;
    } else if (editorNode?.server) {
        selectedServer = editorNode.server;
    } else if (node && isEntityNode()) {
        const entityConfigId = (
            node as HassNodeProperties & {
                entityConfig?: string;
            }
        ).entityConfig;
        if (entityConfigId) {
            const entity = RED.nodes.node(entityConfigId) as
                Record<string, any> | undefined;
            selectedServer = entity?.server;
        }
    }

    if (!selectedServer || selectedServer === '_ADD_') {
        return;
    }

    return selectedServer;
}

function getIntegrationVersion(editorNode?: {
    entityConfig?: string;
    server?: string;
}): string {
    const serverId = getServerId(editorNode);

    if (serverId && version[serverId]) {
        return version[serverId];
    }

    return NO_VERSION;
}

export function isIntegrationLoaded(editorNode?: {
    entityConfig?: string;
    server?: string;
}) {
    return getIntegrationVersion(editorNode) !== NO_VERSION;
}

/**
 * Whether the current Available typed-input is allowed for the connected
 * companion. Default bool/true is always ok; custom settings need 4.2.4+.
 * Used as a node `defaults` validate so the node is marked invalid (orange
 * triangle) and deploy warns.
 */
export function validateAvailableCompanion(
    available?: string,
    availableType?: string,
    editorNode?: HassNodeProperties & {
        entityConfig?: string;
        available?: string;
        availableType?: string;
    },
): boolean {
    const $available = $('#node-input-available');
    if ($available.length) {
        try {
            available = String($available.typedInput('value') ?? '');
            availableType = String($available.typedInput('type') ?? '');
        } catch {
            available =
                ($('#node-input-available').val() as string) ?? available;
            availableType =
                ($('#node-input-availableType').val() as string) ??
                availableType;
        }
    } else if (editorNode) {
        available = available ?? editorNode.available;
        availableType = availableType ?? editorNode.availableType;
    }

    const value = available ?? 'true';
    const type = availableType ?? 'bool';
    if (type === 'bool' && value === 'true') {
        return true;
    }
    // Unknown companion version: allow save; runtime still gates custom use
    if (!isIntegrationLoaded(editorNode)) {
        return true;
    }
    return haUtils.compareVersion(
        COMPANION_MIN_VERSION_ENTITY_AVAILABLE,
        getIntegrationVersion(editorNode),
    );
}

/**
 * Warn when Available is not the default bool/true and companion is too old
 * for optional available / availability-only entity updates.
 */
export function setupAvailableCompanionWarning() {
    const $available = $('#node-input-available');
    const update = () => {
        const companionOk = validateAvailableCompanion();

        if (!$('#availableCompanionAlert').length) {
            const alertText = `
            <div id="availableCompanionAlert" class="ui-state-error ha-alert-box">
                Available settings other than <code>bool</code>/<code>true</code> require the
                <a href="https://github.com/zachowj/hass-node-red" target="_blank" rel="noopener noreferrer">
                Node-RED custom integration version ${COMPANION_MIN_VERSION_ENTITY_AVAILABLE}+
                <i class="fa fa-external-link external-link"></i></a>.
            </div>`;
            $('#dialog-form').prepend(alertText);
        }

        $('#availableCompanionAlert').toggle(
            isIntegrationLoaded() && !companionOk,
        );
    };

    $available.on('change', update);
    $('#node-input-availableType').on('change', update);
    update();
}

function isAddNodeSelected(selector: 'entityConfig' | 'server') {
    return $(`#node-input-${selector}`).val() === '_ADD_';
}

export function init(n: HassNodeProperties) {
    node = n;
    const type = 'type' in node && (node.type as unknown as NodeType);
    render();

    $('#node-input-server, #node-input-entityConfig').on('change', () => {
        switch (type) {
            case NodeType.BinarySensor:
            case NodeType.Button:
            case NodeType.Number:
            case NodeType.Select:
            case NodeType.Sensor:
            case NodeType.Switch:
            case NodeType.Text:
            case NodeType.TimeEntity:
                if (!isAddNodeSelected('entityConfig')) {
                    renderAlert(type);
                }
                break;
            case NodeType.Device:
                renderAlert(type);
                break;
            case NodeType.Sentence:
                {
                    const mode = $('#node-input-mode').val() as SentenceMode;
                    $('#exposed-as-row').toggle(mode === SentenceMode.Trigger);
                    if (!isAddNodeSelected('server')) {
                        renderAlert(type);
                    }
                }
                break;
            case NodeType.Webhook:
                if (!isAddNodeSelected('server')) {
                    renderAlert(type);
                }
                break;
            case NodeType.EventsAll:
            case NodeType.EventsCalendar:
            case NodeType.EventsState:
            case NodeType.PollState:
            case NodeType.Tag:
            case NodeType.TriggerState:
            case NodeType.Zone:
            case NodeType.Time:
            default:
                toggleExposeAs();
                break;
        }
    });

    if (isEntityNode()) {
        $('#node-input-mode').on('change', toggleExposeAsForListenMode);
    }
}

function render() {
    const type = 'type' in node && (node.type as unknown as NodeType);

    switch (type) {
        case NodeType.BinarySensor:
        case NodeType.Button:
        case NodeType.Number:
        case NodeType.Select:
        case NodeType.Sensor:
        case NodeType.Switch:
        case NodeType.Text:
        case NodeType.TimeEntity:
            if (!isAddNodeSelected('entityConfig')) {
                renderAlert(type);
            }
            break;
        case NodeType.Device:
        case NodeType.Sentence:
        case NodeType.Webhook:
            if (!isAddNodeSelected('server')) {
                renderAlert(type);
            }
            break;
        case NodeType.EventsAll:
        case NodeType.EventsCalendar:
        case NodeType.EventsState:
        case NodeType.PollState:
        case NodeType.Tag:
        case NodeType.Time:
        case NodeType.TriggerState:
        case NodeType.Zone:
            break;
        default:
            renderEventNode();
    }
}

// TODO: Can be removed when all nodes are migrated to Typescript
function renderEventNode() {
    const $row = $('<div />', {
        id: 'exposeToHa',
        class: `form-row checkbox-option${
            'type' in node && node.type === 'trigger-state' ? '-left' : ''
        }`,
    });
    $('<input />', {
        type: 'checkbox',
        id: 'node-input-exposeToHomeAssistant',
        checked: node.exposeToHomeAssistant,
    })
        .on('change', function () {
            $('#haConfigRow').toggle(
                $('#node-input-exposeToHomeAssistant').is(':checked') === true,
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
    const $configList = $('<ol />', { id: 'haConfig' }).appendTo($configRow);

    // set default for nodes created before exposeToHomeAssistant was aded
    const haConfig = node.haConfig || [
        { property: 'name', value: '' },
        { property: 'icon', value: '' },
    ];
    $configList
        .editableList({
            addButton: false,
            header: $('<div>Home Assistant Config (optional)</div>'),
            addItem: function (container, index, data: HassExposedConfig) {
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

export function getValues() {
    const arr: { property: string; value: string }[] = [];
    $('#haConfig')
        .editableList('items')
        .each(function () {
            const $row = $(this);
            arr.push({
                property: $row.find('input[name=property]').val() as string,
                value: $row.find('input[name=value]').val() as string,
            });
        });

    return arr;
}

const NodeMinIntegraionVersion = {
    [NodeType.BinarySensor]: '1.1.0',
    [NodeType.Button]: '1.0.4',
    [NodeType.Device]: '4.0.2',
    [NodeType.Number]: '1.3.0',
    [NodeType.Select]: '1.4.0',
    [NodeType.Sentence]: '4.1.0',
    [NodeType.Sensor]: '1.1.0',
    [NodeType.Switch]: '1.1.0',
    [NodeType.Tag]: '0.5.0',
    [NodeType.Text]: '1.3.0',
    [NodeType.TimeEntity]: '2.1.0',
    [NodeType.Webhook]: '1.6.0',
} as const;

function renderAlert(type: keyof typeof NodeMinIntegraionVersion) {
    const minVersion = NodeMinIntegraionVersion[type];
    const currentVersion = getIntegrationVersion();
    const satisfiesVersion =
        !minVersion || haUtils.compareVersion(minVersion, currentVersion);
    const integrationValid = isIntegrationLoaded() && satisfiesVersion;

    if (!$('#integrationAlert').length) {
        const alertText = `
            <div id="integrationAlert" class="ui-state-error ha-alert-box">
                This node requires the <a href="https://github.com/zachowj/hass-node-red" target="_blank">
                Node-RED custom integration${satisfiesVersion ? '' : ` version ${minVersion}+`}
                <i class="fa fa-external-link external-link"></i></a> to be installed in Home Assistant for it to function.
            </div>`;
        $('#dialog-form').prepend(alertText);
    }

    $('#integrationAlert').toggle(!integrationValid);
}

export function toggleExposeAsForListenMode() {
    const mode = $('#node-input-mode').val() as ValueIntegrationMode;
    $('#exposed-as-row').toggle(mode === ValueIntegrationMode.Listen);
}

// TODO: Can be removed when all nodes are migrated to Typescript
function toggleExposeAs() {
    $('#node-input-exposeAsEntityConfig')
        .closest('div.form-row')
        .toggle(isIntegrationLoaded());

    // TODO: remove after typescript conversion done
    if (!isIntegrationLoaded()) {
        $('#node-input-exposeToHomeAssistant')
            .prop('checked', false)
            .trigger('change');
    }
    $('#exposeToHa').toggle(isIntegrationLoaded());
}
