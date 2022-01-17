import { i18n as haI18n } from '../../../editor/i18n';

export function createDeviceExtraFields(
    fields: any[] = [],
    capabilities: any[] = []
) {
    let elements = '';
    fields.forEach((field) => {
        const selectedCapabilities = capabilities.find(
            (i) => i.name === field.name
        );
        let element;
        switch (field.type) {
            case 'float':
                element = createDeviceFloat(field, selectedCapabilities);
                break;
            case 'positive_time_period_dict':
                element = createDeviceDuration(field, selectedCapabilities);
                break;
            case 'select': {
                element = createDeviceSelect(field, selectedCapabilities);
                break;
            }
            case 'string':
                element = createDeviceString(field, selectedCapabilities);
                break;
            default: {
                const text = haI18n('ha-device.error.unknown_field_type', {
                    type: field.type,
                });
                element = createDeviceError(text, { type: field.type });
            }
        }
        if (element) elements += element;
    });

    return elements;
}

function createDeviceFloat(field: any, store: any) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    const icon = ['above', 'below'].includes(field.name)
        ? `<i class="fa fa-angle-double-${
              field.name === 'above' ? 'up' : 'down'
          }"></i> `
        : '';
    let html = `
        <label for="${id}">
            ${icon}${field.name}
        </label>
        <input type="text" id="${id}" style="width: 35%" value="${value}"/>        
        `;
    if (field.description && field.description.suffix) {
        html += `<span>${field.description.suffix}</span>`;
    }

    return wrapWithRow(html, ['deviceExtra']);
}
function createDeviceDuration(field: Record<string, any>, store: any) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    const selected = (unit: string) =>
        store && unit === store.unit ? 'selected' : '';
    const namespace = 'ha-device.label';
    const i18n = {
        seconds: haI18n(`${namespace}.seconds`),
        minutes: haI18n(`${namespace}.minutes`),
        hours: haI18n(`${namespace}.hours`),
    };
    const html = `
        <label for="${id}">
            <i class="fa fa-clock-o"></i> ${field.name}
        </label>
        <input type="text" id="${id}" style="width: 35%" value="${value}"/>
        <select id="${id}Units" style="width: 35%">
            <option value="seconds" ${selected('seconds')}>${
        i18n.seconds
    }</option>
            <option value="minutes" ${selected('minutes')}>${
        i18n.minutes
    }</option>
            <option value="hours" ${selected('hours')}>${i18n.hours}</option>
        </select>`;
    return wrapWithRow(html, ['deviceExtra']);
}

function createDeviceSelect(
    field: Record<string, any>,
    store: Record<string, any> = {}
) {
    const id = `deviceExtra-${field.name}`;
    const options = field.options.reduce(
        (acc: any[], [val, str]: [string, string]) => {
            const selected = store.value === val ? 'selected' : '';
            acc.push(`<option value="${val}" ${selected}>${str}</option>`);
            return acc;
        },
        []
    );

    const html = `
        <label for="${id}">${field.name}</label>
        <select id="${id}" style="width: 70%">
        ${options.join('')}
        </select>        
        `;
    return wrapWithRow(html, ['deviceExtra']);
}

function createDeviceString(
    field: Record<any, string>,
    store: Record<any, string>
) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    const html = `
        <label for="${id}">${field.name}</label>
        <input type="text" id="${id}" style="width: 70%" value="${value}"/>
        `;
    return wrapWithRow(html, ['deviceExtra']);
}

function createDeviceError(text: string, opts: any = {}) {
    const html = `<label class="error"><i class="fa fa-exclamation-triangle"></i> Error</label>${text} -- <a href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/new?title=[Device Node] Unknown extra type: ${
        opts.type
    }" target="_blank"> ${haI18n('ha-device.error.report')}</a>`;
    return wrapWithRow(html, ['deviceExtra']);
}

function wrapWithRow(ele: string, cls: string[] = []) {
    return `<div class="form-row ${cls.join(' ')}">${ele}</div>`;
}

export function getCapabilities(capabilities: any[] = []) {
    const properties = capabilities.reduce((acc, item) => {
        const id = `deviceExtra-${item.name}`;
        const value = $(`#${id}`).val() as string;
        switch (item.type) {
            case 'float':
            case 'positive_time_period_dict':
                if (value && value.length && !isNaN(Number(value))) {
                    const cap = {
                        name: item.name,
                        type: item.type,
                        value: Number(value),
                        unit:
                            item.type === 'positive_time_period_dict'
                                ? $(`#${id}Units`).val()
                                : undefined,
                    };
                    acc.push(cap);
                }
                break;
            case 'select':
                if (value && value.length) {
                    acc.push({
                        name: item.name,
                        type: item.type,
                        value,
                    });
                }
                break;
            case 'string':
                if (value.length) {
                    acc.push({
                        name: item.name,
                        type: item.type,
                        value: value,
                    });
                }
                break;
        }

        return acc;
    }, []);

    return properties;
}
