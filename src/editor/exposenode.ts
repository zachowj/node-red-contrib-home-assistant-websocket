import { EditorRED } from 'node-red';

import { NO_VERSION, NodeType } from '../const';
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
    return node?.type && nodes.includes(node.type);
}

function getServerId(): string | undefined {
    let selectedServer: string = $('#node-input-server').val() as string;
    if (isEntityNode()) {
        const entity: Record<string, any> = RED.nodes.node(
            $('#node-input-entityConfig').val() as string
        ) as Record<string, any>;
        selectedServer = entity?.server;
    }

    if (!selectedServer || selectedServer === '_ADD_') {
        return;
    }

    return selectedServer;
}

function getIntegrationVersion(): string {
    const serverId = getServerId();

    if (serverId && version[serverId]) {
        return version[serverId];
    }

    return NO_VERSION;
}

export function isIntegrationLoaded() {
    return getIntegrationVersion() !== NO_VERSION;
}

function isAddNodeSelected(selector: 'entityConfig' | 'server') {
    return $(`#node-input-${selector}`).val() === '_ADD_';
}

export function init(n: HassNodeProperties) {
    node = n;
    const type = node.type as unknown as NodeType;
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
            case NodeType.Webhook:
                if (!isAddNodeSelected('server')) {
                    renderAlert(type);
                }
                break;
            case NodeType.EventsAll:
            case NodeType.EventsState:
            case NodeType.PollState:
            case NodeType.Tag:
            case NodeType.Zone:
            case NodeType.Time:
            default:
                toggleExposeAs();
                break;
        }
    });
}

function render() {
    const type = node.type as unknown as NodeType;

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
        case NodeType.Sentence:
        case NodeType.Webhook:
            if (!isAddNodeSelected('server')) {
                renderAlert(type);
            }
            break;
        case NodeType.PollState:
        case NodeType.Tag:
        case NodeType.Time:
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
                $('#node-input-exposeToHomeAssistant').is(':checked') === true
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
    [NodeType.Device]: '0.5.0',
    [NodeType.Number]: '1.3.0',
    [NodeType.Select]: '1.4.0',
    [NodeType.Sentence]: '2.2.0',
    [NodeType.Sensor]: '1.1.0',
    [NodeType.Switch]: '1.1.0',
    [NodeType.Tag]: '0.5.0',
    [NodeType.Text]: '1.3.0',
    [NodeType.TimeEntity]: '2.1.0',
    [NodeType.Webhook]: '1.6.0',
} as const;

function renderAlert(type: NodeType) {
    const minVersion = NodeMinIntegraionVersion[type];
    const satisfiesVersion =
        minVersion === undefined ||
        haUtils.compareVersion(minVersion, getIntegrationVersion());
    const integartionValid = isIntegrationLoaded() && satisfiesVersion;
    if (!$('#integrationAlert').length) {
        const alertText = `
            <div id="integrationAlert" class="ui-state-error ha-alert-box">
                This node requires <a href="https://github.com/zachowj/hass-node-red" target="_blank">Node-RED custom integration ${
                    satisfiesVersion ? '' : `version ${minVersion}+`
                } <i class="fa fa-external-link external-link"></i></a> to be installed in Home Assistant for it to function.
            </div>`;
        $('#dialog-form').prepend(alertText);
    }
    $('#integrationAlert').toggle(!integartionValid);
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
