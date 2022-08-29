import { EditorNodeProperties, EditorRED } from 'node-red';

import { sensorUnitOfMeasurement } from './ha-config-data';

declare const RED: EditorRED;

const packageName = 'node-red-contrib-home-assistant-websocket/all:';

export const createServerList = (selectedServier: string) => {
    let html = '';
    RED.nodes.eachConfig((n: EditorNodeProperties) => {
        if (n.type === 'server') {
            html += `<option value="${n.id}" ${
                selectedServier === n.id && 'selected'
            }>${n.name}</option>`;
        }
        return true;
    });

    return html;
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
