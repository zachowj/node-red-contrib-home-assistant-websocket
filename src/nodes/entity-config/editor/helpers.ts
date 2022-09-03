import { EditorNodeInstance, EditorNodeProperties, EditorRED } from 'node-red';

import { sensorUnitOfMeasurement } from './data/sensor';

declare const RED: EditorRED;

const packageName = 'node-red-contrib-home-assistant-websocket/all:';

export const createConfigList = (
    id: 'server' | 'deviceConfig',
    node: EditorNodeInstance,
    options?: { allowNone?: boolean }
) => {
    const $div = $(`
        <div style="width: 70%; display: inline-flex">    
            <select id="node-config-input-${id}" style="flex: 1"></select>
            <a class="red-ui-button" style="margin-left: 10px"><i class="fa fa-pencil"></i></a>
        </div>
    `);

    let selectOptions = options?.allowNone ? '<option value="">' : '';
    const type = id === 'server' ? 'server' : 'ha-device-config';
    RED.nodes.eachConfig((n: EditorNodeProperties) => {
        if (n.type === type) {
            selectOptions += `<option value="${n.id}" ${
                node[id] === n.id && 'selected'
            }>${n.name}</option>`;
        }
        return true;
    });

    selectOptions += `<option value="_ADD_">add new ${type}...</option>`;
    $div.find('select').html(selectOptions);

    $div.find('a').on('click', () => {
        const selected = $div.find('select').val();
        if (!selected) return;
        RED.editor.editConfig(
            id,
            type,
            selected,
            'node-config-input',
            // @ts-expect-error - editConfig accepts 5 arguments
            node
        );
    });

    return $div;
};

const createDate = (
    id: string,
    value: string,
    data: { id: any; type?: any }
) => {
    return $('<input />', {
        type: 'date',
        name: 'value',
        value,
        id,
        'data-property': data.id,
    });
};

const createDateTime = (
    id: string,
    value: string,
    data: { id: any; type?: any }
) => {
    // Convert ISO format date to local datetime
    const date = new Date(value);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const dateString = value
        ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
              date.getDate()
          )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
        : '';

    return $('<input />', {
        type: 'datetime-local',
        name: 'value',
        value: dateString,
        id,
        'data-property': data.id,
    });
};

const createInput = (
    id: string,
    value: string,
    data: { id: any; type?: any }
) => {
    return $('<input />', {
        type: 'text',
        name: 'value',
        value,
        id,
        'data-property': data.id,
    }).attr('autocomplete', 'off');
};

const createSelect = (
    id: string,
    selectedValue: string,
    data: { id: string; type?: any; values?: any }
) => {
    const $select = $('<select />', {
        name: 'value',
        id,
        style: 'width: 70%',
        'data-property': data.id,
    });
    const i18n = `${packageName}ha-entity-config.label.${data.id}_options`;
    data.values.forEach((value) => {
        $('<option />', {
            value,
            text: value ? RED._(`${i18n}.${value}`) : '',
            selected: value === selectedValue,
        }).appendTo($select);
    });
    return $select;
};

export const createSensorUom = (
    id: string,
    selectedValue: string,
    data: { id: string; type?: any; values?: any }
) => {
    const deviceClass = $('#ha-config-device_class').val() as string;
    const values = sensorUnitOfMeasurement[deviceClass];
    if (deviceClass === '' || values === null) {
        return createInput(id, selectedValue, data);
    }

    const $select = $('<select />', {
        name: 'value',
        id,
        style: 'width: 70%',
        'data-property': data.id,
    });

    values.forEach((value) => {
        $('<option />', {
            value,
            text: value,
            selected: value === selectedValue,
        }).appendTo($select);
    });

    return $select;
};

export const createRow = (
    value: any,
    data: { id: string; type: any; values?: any }
) => {
    const id = `ha-config-${data.id}`;
    const $row = $('<div />', {
        class: 'form-row ha-config-row',
        'data-type': data.type,
    });

    $('<label>', { for: id })
        .text(RED._(`${packageName}ha-entity-config.label.${data.id}`))
        .appendTo($row);

    $row.append(' ');

    switch (data.type) {
        case 'date':
            $row.append(createDate(id, value, data));
            break;
        case 'datetime':
            $row.append(createDateTime(id, value, data));
            break;
        case 'select':
            $row.append(createSelect(id, value, data));
            break;
        case 'sensor_uom': {
            $row.append(createSensorUom(id, value, data));
            break;
        }
        case 'string':
            $row.append(createInput(id, value, data));
            break;
    }

    return $row;
};

export const saveEntityType = (
    type: 'button' | 'binary_sensor' | 'sensor' | 'switch'
) => {
    $('#node-input-lookup-entityConfig').on('click', function () {
        if ($('#node-input-entityConfig').val() === '_ADD_') {
            $('body').data('haEntityType', type);
        }
    });
};

export const setEntityType = () => {
    const type = $('body').data('haEntityType');
    if (type) {
        $('#node-config-input-entityType').val(type);
        $('body').data('haEntityType', null);
    }
};
