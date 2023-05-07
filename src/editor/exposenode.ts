import { EditorRED } from 'node-red';

import { NodeType } from '../const';
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
        NodeType.Button,
        NodeType.BinarySensor,
        NodeType.Sensor,
        NodeType.Switch,
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

    if (serverId && version && version[serverId] && version[serverId] !== '0') {
        return version[serverId];
    }

    return '0';
}

export function isIntegrationLoaded() {
    const serverId = getServerId();

    if (serverId && version[serverId] && version[serverId] !== '0') {
        return true;
    }

    return false;
}

export function init(n: HassNodeProperties) {
    node = n;
    render();

    $('#node-input-server, #node-input-entityConfig').on('change', () => {
        switch (node.type as unknown) {
            case NodeType.Webhook:
            case NodeType.Entity:
                renderAlert();
                break;
            case NodeType.BinarySensor:
            case NodeType.Sensor:
            case NodeType.Switch:
                if ($('#node-input-entityConfig').val() !== '_ADD_') {
                    renderAlert('1.1.0');
                }
                break;
            case NodeType.Button:
                if ($('#node-input-entityConfig').val() !== '_ADD_') {
                    renderAlert('1.0.4');
                }
                break;
            case NodeType.Number:
                renderAlert('1.3.0');
                break;
            case NodeType.Device:
                renderAlert('0.5.0');
                break;
            default:
                toggleExpose();
                break;
        }
    });
}

function render() {
    switch (node.type as unknown) {
        case NodeType.Webhook:
        case NodeType.Entity:
            renderAlert();
            break;
        case NodeType.BinarySensor:
        case NodeType.Sensor:
        case NodeType.Switch:
            if ($('#node-input-entityConfig').val() !== '_ADD_') {
                renderAlert('1.1.0');
            }
            break;
        case NodeType.Button:
            if ($('#node-input-entityConfig').val() !== '_ADD_') {
                renderAlert('1.0.4');
            }
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

function renderAlert(minVersion?: string) {
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
