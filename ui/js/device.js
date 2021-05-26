/* global RED: false, jQuery: false, $: false, exposeNode: false, ha: false, haServer: false, nodeVersion: false, haOutputs: false, haData: false, haUtils: false */
const haDeviceTrigger = (function () {
    const inputCount = 0;
    const getCapabilitiesList = async (trigger) =>
        await haServer.fetch('deviceTriggerCapabilities', {
            trigger,
        });

    const getEventList = async (deviceId) =>
        await haServer.fetch('deviceTriggers', {
            deviceId,
        });

    const setDefaultOutputs = (config) => {
        return config;
    };

    return {
        inputCount,
        getCapabilitiesList,
        getEventList,
        setDefaultOutputs,
    };
})();

const haDeviceAction = (function () {
    const inputCount = 1;

    const getCapabilitiesList = async (action) =>
        await haServer.fetch('deviceActionCapabilities', {
            action,
        });

    const getEventList = async (deviceId) =>
        await haServer.fetch('deviceActions', {
            deviceId,
        });

    const setDefaultOutputs = () => {
        return [];
    };

    return {
        inputCount,
        getCapabilitiesList,
        getEventList,
        setDefaultOutputs,
    };
})();

const haDevice = (function (action, trigger) {
    const getDevice = (type) => (type === 'action' ? action : trigger);

    const validateCapabilities = (capabilities) => {
        if (!Array.isArray(capabilities)) return true;

        for (const capability of capabilities) {
            switch (capability.type) {
                case 'float':
                    if (!Number.isFinite(Number(capability.value))) {
                        return false;
                    }
                    break;
                case 'positive_time_period_dict': {
                    const sign = Math.sign(capability.value);
                    if (sign === -1) return false;
                    break;
                }
            }
        }

        return true;
    };

    return {
        getDevice,
        validateCapabilities,
    };
})(haDeviceAction, haDeviceTrigger);

const haDeviceUI = (function ($) {
    function createDeviceExtraFields(fields = [], capabilities) {
        let elements = '';
        fields.forEach((field) => {
            const selectedCapabilities =
                capabilities && capabilities.find((i) => i.name === field.name);
            let element;
            switch (field.type) {
                case 'float':
                    element = createDeviceFloat(field, selectedCapabilities);
                    break;
                case 'positive_time_period_dict':
                    element = createDeviceDuration(field, selectedCapabilities);
                    break;
                case 'string':
                    element = createDeviceString(field, selectedCapabilities);
                    break;
            }
            if (element) elements += element;
        });

        return elements;
    }

    function createDeviceFloat(field, store) {
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
    function createDeviceDuration(field, store) {
        const id = `deviceExtra-${field.name}`;
        const value = store ? store.value : '';
        const selected = (unit) =>
            store && unit === store.unit ? 'selected' : '';
        const namespace = 'ha-device.label';
        const i18n = {
            seconds: ha.i18n(`${namespace}.seconds`),
            minutes: ha.i18n(`${namespace}.minutes`),
            hours: ha.i18n(`${namespace}.hours`),
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

    function createDeviceString(field, store) {
        const id = `deviceExtra-${field.name}`;
        const value = store ? store.value : '';
        const html = `
        <label for="${id}">${field.name}</label>
        <input type="text" id="${id}" style="width: 70%" value="${value}"/>
        `;
        return wrapWithRow(html, ['deviceExtra']);
    }

    function createOption(opts) {}

    function wrapWithRow(ele, cls = []) {
        return `<div class="form-row ${cls.join(' ')}">${ele}</div>`;
    }

    function getCapabilities(capabilities = []) {
        const properties = capabilities.reduce((acc, item) => {
            const id = `deviceExtra-${item.name}`;
            const value = $(`#${id}`).val();
            switch (item.type) {
                case 'float':
                case 'positive_time_period_dict':
                    if (value && value.length && !isNaN(value)) {
                        const cap = {
                            name: item.name,
                            type: item.type,
                            value: Number(value),
                        };
                        if (item.type === 'positive_time_period_dict') {
                            cap.unit = $(`#${id}Units`).val();
                        }
                        acc.push(cap);
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

    return {
        createDeviceExtraFields,
        createOption,
        getCapabilities,
    };
})(jQuery);

RED.nodes.registerType('ha-device', {
    category: 'home_assistant',
    color: ha.nodeColors.alpha,
    inputs: 0,
    outputs: 1,
    icon: 'font-awesome/fa-cube',
    paletteLabel: 'device',
    label: function () {
        return this.name || `device ${this.deviceType}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.haDeviceVersion },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        inputs: { value: 0 },
        deviceType: { value: 'trigger' },
        device: { value: '' },
        event: { value: undefined, validate: (v) => v !== undefined },
        capabilities: { value: [], validate: haDevice.validateCapabilities },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'eventData',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        const SERVER_ADD = '_ADD_';
        const TYPE_TRIGGER = 'trigger';
        const $server = $('#node-input-server');
        const $type = $('#node-input-deviceType');
        const $device = $('#node-input-device');
        const $event = $('#event');
        let event = haDevice.getDevice($type.val());
        let translations;

        $device
            .select2({ theme: 'nodered' })
            .on('select2:select', (e) => updateEvents(e.target.value));
        $event.on('change', function (e) {
            const value = e.target.value;
            if (value === '__NONE__') return;
            const data = $event.data('events');
            updateCapabilities(data[value]);
        });

        const sortDevices = (a, b) => {
            const aName = haUtils.deepFind('name', a);
            const bName = haUtils.deepFind('name', b);
            if (aName === bName) return 0;
            if (typeof aName !== 'string') return 1;

            return aName.localeCompare(bName);
        };

        const resetElements = () => {
            clearEventSelect();
            clearDeviceExtras();
        };

        const fetchTranslations = async () => {
            const lang = RED.i18n.lang();
            translations = await haServer
                .fetch('translations', {
                    cat: 'device_automation',
                    lang,
                })
                .catch(() => {
                    RED.notify('Error retrieving translations.', 'error');
                });
        };

        const populateDevices = (deviceId) => {
            const serverId = $server.val();
            if (serverId === SERVER_ADD) return;

            const devices = haData.getDevices(serverId);
            if (!devices) return;

            const options = devices
                .map((d) => {
                    return { id: d.id, name: d.name_by_user || d.name };
                })
                .sort(sortDevices)
                .reduce((acc, item) => {
                    const selected = item.id === deviceId;
                    acc.push(
                        new Option(item.name, item.id, selected, selected)
                    );
                    return acc;
                }, []);
            $device.empty().append(options);
        };

        const onServerChange = async () => {
            resetElements();
            if ($server.val() === SERVER_ADD) return;
            fetchTranslations();
            populateDevices();
            updateEvents($device.val());
        };

        const onTypeChange = (e) => {
            const deviceId = $device.val();
            const type = e.target.value;

            clearDeviceExtras();
            if (deviceId) {
                event = haDevice.getDevice(type);
                updateEvents(deviceId);
            }
            haOutputs.setTypes(getExtraTypes(type));
            const propertiesList =
                type === TYPE_TRIGGER
                    ? this._def.defaults.outputProperties.value
                    : [];
            const defaultProperties = event.setDefaultOutputs(propertiesList);
            haOutputs.loadData(defaultProperties);

            $('#event').prev().text(type);
            $('#haConfigRow').toggle(type === TYPE_TRIGGER);
        };

        $server.one('change', () => {
            resetElements();
            populateDevices(this.device);
            if ($server.val() !== SERVER_ADD) {
                fetchTranslations();
                updateEvents(this.device, this.event, this.capabilities);
            }
            setTimeout(() => {
                $server.on('change', onServerChange);
                $type.on('change', onTypeChange);
            }, 100);
        });

        const clearEventSelect = () => {
            $event
                .html(`<option value="__NONE__">No ${$type.val()}s</option>`)
                .trigger('change')
                .prop('disabled', true);
        };

        const clearDeviceExtras = () => {
            $('.deviceExtra').remove();
        };

        const updateEvents = async (deviceId, selected, capabilities) => {
            if (!deviceId) return;
            const data = await event.getEventList(deviceId);
            let selectedIndex;
            if (data.length === 0) {
                clearEventSelect();
                clearDeviceExtras();
                selectedIndex = 0;
            } else {
                const deviceType = $type.val();
                $event.data('events', data).empty().prop('disabled', false);
                const options = [];
                for (let index = 0; index < data.length; index++) {
                    const str = await localizeDeviceEvent(
                        deviceType,
                        data[index]
                    );
                    options.push(new Option(str, index));
                }
                $event.append(options);

                selectedIndex = data.findIndex((item) =>
                    haUtils.compareObjects(selected, item)
                );
                selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
                updateCapabilities(data[selectedIndex], capabilities);
            }
            $('option', $event).eq(selectedIndex).prop('selected', true);
        };

        const updateCapabilities = async (action, capabilities) => {
            clearDeviceExtras();
            const data = await event.getCapabilitiesList(action);
            if (data.extra_fields && data.extra_fields.length) {
                $event.data('capabilities', data.extra_fields);
                const html = haDeviceUI.createDeviceExtraFields(
                    data.extra_fields,
                    capabilities
                );
                $event.parent().after(html);
            }
        };

        const localizeDeviceEvent = async (eventType, event) => {
            const translateKey = (type = 'type') =>
                `component.${event.domain}.device_automation.${eventType}_${type}.${event[type]}`;
            let desc =
                (translations && translations[translateKey()]) ||
                (event.subtype
                    ? `"${event.subtype}" ${event.type}`
                    : event.type);

            const vars = {
                entity_name: async () => {
                    if (!event.entity_id) return '<unknown>';

                    const entity = haData.getEntity(
                        $server.val(),
                        event.entity_id
                    );

                    if (!entity) return '';

                    return !entity.attributes ||
                        entity.attributes.friendly_name === undefined
                        ? event.entity_id.split('.')[1].replace(/_/g, ' ')
                        : entity.attributes.friendly_name || '';
                },
                subtype: () =>
                    translations[translateKey('subtype')] || event.subtype,
            };
            for (const key in vars) {
                const str = `{${key}}`;
                if (desc.indexOf(str) !== -1) {
                    const value = await vars[key]();
                    desc = desc.replace(str, value);
                }
            }

            return desc;
        };

        const getExtraTypes = (type) => {
            const extraTypes = {
                action: ['sentData'],
                trigger: ['eventData', 'deviceId'],
            };
            return extraTypes[type];
        };

        $('#dialog-form').prepend(ha.alphaWarning(367));
        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: getExtraTypes($type.val()),
        });
        $('#haConfigRow').toggle($type.val() === TYPE_TRIGGER);
        $('#exposeToHa').remove();
    },
    oneditsave: function () {
        const event = haDevice.getDevice($('#node-input-deviceType').val());
        const $event = $('#event');
        const eventType = $event.val();
        this.inputs = event.inputCount;
        if (eventType !== '__NONE__') {
            const events = $event.data('events');
            const capabilities = $event.data('capabilities');
            this.event = events[eventType];
            this.capabilities = haDeviceUI.getCapabilities(capabilities);
        }
        this.haConfig = exposeNode.getValues();
        this.outputProperties = haOutputs.getOutputs();
    },
});
