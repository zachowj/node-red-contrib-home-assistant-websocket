import { i18n as haI18n } from '../../../editor/i18n';

function createLabel(name: string, id: string) {
    return `<label for="${id}">${name.replace(/_/g, ' ')}</label>`;
}

export function createDeviceExtraFields(
    fields: any[] = [],
    capabilities: any[] = [],
) {
    const elements: JQuery[] = [];
    fields.forEach((field) => {
        const selectedCapabilities = capabilities.find(
            (i) => i.name === field.name,
        );
        switch (field.type) {
            case 'boolean': {
                const element = createDeviceBoolean(
                    field,
                    selectedCapabilities,
                );
                elements.push($(element));
                break;
            }
            case 'float': {
                const element = createDeviceFloat(field, selectedCapabilities);
                elements.push($(element));
                break;
            }
            case 'integer': {
                const element = createDeviceInteger(
                    field,
                    selectedCapabilities,
                );
                elements.push(element);
                break;
            }
            case 'positive_time_period_dict': {
                const element = createDeviceDuration(
                    field,
                    selectedCapabilities,
                );
                elements.push($(element));
                break;
            }
            case 'select': {
                const element = createDeviceSelect(field, selectedCapabilities);
                elements.push($(element));
                break;
            }
            case 'string': {
                const element = createDeviceString(field, selectedCapabilities);
                elements.push($(element));
                break;
            }
            default: {
                const text = haI18n('ha-device.error.unknown_field_type', {
                    type: field.type,
                });
                const element = createDeviceError(text, {
                    type: field.type,
                });
                elements.push($(element));
            }
        }
    });

    return elements;
}

function createDeviceBoolean(field: any, store: any) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    const html = `${createLabel(field.name, id)}        
        <input type="checkbox" id="${id}" style="width: auto" value="${value}"/>        
        `;

    return wrapWithRow(html);
}

function createDeviceFloat(field: any, store: any) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    let html = `
        ${createLabel(field.name, id)}
        <input type="text" id="${id}" style="width: 35%" value="${value}"/>        
        `;
    if (field.description && field.description.suffix) {
        html += `<span>${field.description.suffix}</span>`;
    }

    return wrapWithRow(html);
}

function createDeviceInteger(field: any, store: any) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    const $elements = $(`
        ${createLabel(field.name, id)}
        <div class="range-row">
            <input type="checkbox" />
            <input type="range" id="${id}" max="${field.valueMax}" min="${
                field.valueMin ?? 0
            }" value="${value}" />
            <input type="text" value="${value}" />
        </div>
        `);
    const $checkbox = $elements.find('input[type="checkbox"]');
    const $range = $elements.find('input[type="range"]');
    const $text = $elements.find('input[type="text"]');
    if (field.optional === false || store?.value !== undefined) {
        $checkbox.prop('checked', true);
    }
    if (field.optional === false) {
        $checkbox.hide();
    }
    $checkbox
        .on('change', () => {
            $range
                .prop('disabled', !$checkbox.prop('checked'))
                .trigger('change');
            $text.prop('disabled', !$checkbox.prop('checked'));
        })
        .trigger('change');
    $range
        .on('change input', () => {
            $text.val($range.val() as string);
        })
        .trigger('change');
    $text.on('keyup change', () => {
        const val = $text.val() as string;
        if (val.length > 0) {
            const num = Number(val);
            if (num < field.valueMin) $text.val(field.valueMin);
            if (num > field.valueMax) $text.val(field.valueMax);
            $range.val($text.val() as string);
        }
    });

    return wrapWithRow($elements);
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
        ${createLabel(field.name, id)}
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
    return wrapWithRow(html);
}

function createDeviceSelect(
    field: Record<string, any>,
    store: Record<string, any> = {},
) {
    const id = `deviceExtra-${field.name}`;
    const options = field.options.reduce(
        (acc: any[], [val, str]: [string, string]) => {
            const selected = store.value === val ? 'selected' : '';
            acc.push(`<option value="${val}" ${selected}>${str}</option>`);
            return acc;
        },
        [],
    );

    const html = `
        ${createLabel(field.name, id)}
        <select id="${id}" style="width: 70%">
        ${options.join('')}
        </select>        
        `;
    return wrapWithRow(html);
}

function createDeviceString(
    field: Record<any, string>,
    store: Record<any, string>,
) {
    const id = `deviceExtra-${field.name}`;
    const value = store ? store.value : '';
    const html = `
        ${createLabel(field.name, id)}
        <input type="text" id="${id}" style="width: 70%" value="${value}"/>
        `;
    return wrapWithRow(html);
}

function createDeviceError(text: string, opts: any = {}) {
    const html = `<label class="error"><i class="fa fa-exclamation-triangle"></i> Error</label>${text} -- <a href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/new?title=[Device Node] Unknown extra type: ${
        opts.type
    }" target="_blank"> ${haI18n('ha-device.error.report')}</a>`;
    return wrapWithRow(html);
}

function wrapWithRow(ele: JQuery, cls?: string[]): JQuery;
function wrapWithRow(ele: string, cls?: string[]): string;
function wrapWithRow(ele: unknown, cls: string[] = ['deviceExtra']): unknown {
    if (ele instanceof $) {
        return $(`<div class="form-row ${cls.join(' ')}"></div>`).append(
            ele as JQuery,
        );
    }
    return `<div class="form-row ${cls.join(' ')}">${ele}</div>`;
}

export function getCapabilities(capabilities: any[] = []) {
    const properties = capabilities.reduce((acc, item) => {
        const id = `deviceExtra-${item.name}`;
        const value = $(`#${id}`).val() as string;
        switch (item.type) {
            case 'boolean':
                acc.push({
                    name: item.name,
                    type: item.type,
                    value: $(`#${id}`).is(':checked'),
                });
                break;
            case 'float':
            case 'positive_time_period_dict':
                if (value?.length && !isNaN(Number(value))) {
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
            case 'integer': {
                const $sel = $<HTMLSelectElement>(`#${id}`);
                const checked = $sel
                    .siblings('input[type="checkbox"]')
                    .prop('checked');
                if (checked && value?.length && !isNaN(Number(value))) {
                    const cap = {
                        name: item.name,
                        type: item.type,
                        value: Number(value),
                    };
                    acc.push(cap);
                }
                break;
            }
            case 'select':
                if (value.length) {
                    acc.push({
                        name: item.name,
                        type: item.type,
                        value,
                    });
                }
                break;
            case 'string':
                if (value?.length) {
                    acc.push({
                        name: item.name,
                        type: item.type,
                        value,
                    });
                }
                break;
        }

        return acc;
    }, []);

    return properties;
}
