import { EditorNodeDef, EditorRED } from 'node-red';

import { EntityType, NodeType, TypedInputTypes } from '../../../const';
import * as haOutputs from '../../../editor/components/output-properties';
import * as haData from '../../../editor/data';
import * as exposeNode from '../../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../../editor/ha';
import * as haServer from '../../../editor/haserver';
import { HassNodeProperties, OutputProperty } from '../../../editor/types';
import * as haUtils from '../../../editor/utils';
import {
    HassDeviceAction,
    HassDeviceCapabilities,
    HassDeviceTrigger,
    HassTranslation,
} from '../../../types/home-assistant';
import { saveEntityType } from '../../entity-config/editor/helpers';
import { DeviceType } from '../const';
import * as action from './action';
import * as trigger from './trigger';
import * as deviceUI from './ui';
import { buildDevices } from './utils';

declare const RED: EditorRED;

function getDevice(type: string) {
    return type === DeviceType.Action ? action : trigger;
}

function validateCapabilities(capabilities: any) {
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
}

interface DeviceEditorNodeProperties extends HassNodeProperties {
    deviceType: string;
    device: string;
    event?: string;
    capabilities?: any[];
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;

    // deprecated but still needed for migration
    exposeToHomeAssistant: undefined;
    haConfig: undefined;
}

const defaultOutputProperties: OutputProperty[] = [
    {
        property: 'payload',
        propertyType: TypedInputTypes.Message,
        value: '',
        valueType: 'eventData',
    },
    {
        property: 'topic',
        propertyType: TypedInputTypes.Message,
        value: '',
        valueType: 'triggerId',
    },
];

const DeviceEditor: EditorNodeDef<DeviceEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.Beta,
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
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haDeviceVersion', 0) },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        // @ts-ignore - DefinitelyTyped sets property to unchangable
        inputs: { value: 0 },
        deviceType: { value: DeviceType.Trigger },
        device: { value: '' },
        event: { value: undefined, validate: (v) => v !== undefined },
        capabilities: { value: [], validate: validateCapabilities },
        outputProperties: {
            value: defaultOutputProperties,
            validate: haOutputs.validate,
        },

        // deprecated but still needed for migration
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
    },
    oneditprepare: async function () {
        const SERVER_ADD = '_ADD_';
        const $server = $<HTMLSelectElement>('#node-input-server');
        const $type = $<HTMLSelectElement>('#node-input-deviceType');
        const $device = $('#ha-device');
        const $event = $<HTMLSelectElement>('#event');

        ha.setup(this);
        haServer.init(this, '#node-input-server', async (serverId) => {
            resetElements();
            // @ts-expect-error - VirtualSelect is not recognized
            $device[0].setOptions(buildDevices(serverId));

            if (serverId === SERVER_ADD) return;

            await fetchTranslations();
            await updateEvents($device.val() as string);
        });
        exposeNode.init(this);
        let event = getDevice($type.val() as string);
        let translations: HassTranslation;
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        const fetchTranslations = async () => {
            const lang = RED.i18n.lang();
            try {
                translations = await haServer.fetch('translations', {
                    cat: 'device_automation',
                    lang,
                });
            } catch (err) {
                RED.notify('Error retrieving translations.');
            }
        };

        await fetchTranslations();

        // Device selector
        // @ts-expect-error - VirtualSelect is not recognized
        VirtualSelect.init({
            ele: '#ha-device',
            allowNewOption: true,
            search: true,
            maxWidth: '70%',
            placeholder: '',
            selectedValue: this.device,
            silentInitialValueSet: true,
            hasOptionDescription: true,
            options: buildDevices(haServer.getSelectedServerId()),
            optionsCount: 8,
            hideClearButton: true,
        });
        $device.on(
            // @ts-expect-error - no idea why this is not recognized
            'change',
            async function (
                e: JQuery.TriggeredEvent<any, any, HTMLSelectElement>,
            ) {
                await updateEvents(e.currentTarget.value);
            },
        );

        $event.on(
            'change',
            async function (
                e: JQuery.TriggeredEvent<any, any, HTMLSelectElement>,
            ) {
                const value = e.currentTarget.value;
                if (value === '__NONE__') return;
                const data = $event.data('events');
                await updateCapabilities(data[value]);
            },
        );

        const resetElements = () => {
            clearEventSelect();
            clearDeviceExtras();
        };

        const onTypeChange = async (
            e: JQuery.TriggeredEvent<any, any, HTMLSelectElement>,
        ) => {
            const deviceId = $device.val() as string;
            const type = e.currentTarget.value as DeviceType;

            clearDeviceExtras();
            if (deviceId) {
                event = getDevice(type);
                await updateEvents(deviceId);
            }
            haOutputs.setTypes(getExtraTypes(type));
            const propertiesList =
                type === DeviceType.Trigger ? defaultOutputProperties : [];
            const defaultProperties = event.setDefaultOutputs(propertiesList);
            haOutputs.loadData(defaultProperties);

            $event.prev().text(type);

            $('#node-input-exposeAsEntityConfig')
                .closest('div.form-row')
                .toggle(type === DeviceType.Trigger);
        };

        $server.one('change', async () => {
            resetElements();
            if ($server.val() !== SERVER_ADD) {
                await updateEvents(this.device, this.event, this.capabilities);
            }
            setTimeout(() => {
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

        const updateEvents = async (
            deviceId: string,
            selected?: string,
            capabilities?: any,
        ) => {
            if (!deviceId) return;

            const data = await event.getEventList(deviceId).catch((err) => {
                RED.notify(err);
                return [];
            });

            let selectedIndex: number;
            if (data.length === 0) {
                clearEventSelect();
                clearDeviceExtras();
                selectedIndex = 0;
            } else {
                // ignore if selected device has already changed
                if (data[0].device_id !== $device.val()) return;

                const deviceType = $type.val() as string;
                $event.data('events', data).empty().prop('disabled', false);
                const options: HTMLOptionElement[] = [];
                for (let index = 0; index < data.length; index++) {
                    const str = localizeDeviceEvent(deviceType, data[index]);
                    options.push(new Option(str, index.toString()));
                }
                $event.append(options);

                selectedIndex = data.findIndex((item) =>
                    haUtils.compareObjects(selected, item),
                );
                selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
                updateCapabilities(data[selectedIndex], capabilities);
            }
            $('option', $event).eq(selectedIndex).prop('selected', true);
        };

        const updateCapabilities = async (
            action: HassDeviceTrigger | HassDeviceAction,
            capabilities?: HassDeviceCapabilities,
        ) => {
            clearDeviceExtras();
            const data = await event
                .getCapabilitiesList(action)
                .catch((err) => {
                    RED.notify(err);
                    return [];
                });
            if (data?.length) {
                $event.data('capabilities', data);
                const html = deviceUI.createDeviceExtraFields(
                    data,
                    capabilities,
                );
                $event.parent().after(html);
            }
        };

        const localizeDeviceEvent = (
            eventType: string,
            event: Record<string, any>,
        ) => {
            const translateKey = (type = 'type') =>
                `component.${event.domain}.device_automation.${eventType}_${type}.${event[type]}`;

            let desc =
                translations?.[translateKey()] ??
                (event.subtype
                    ? `"${event.subtype}" ${event.type}`
                    : event.type);

            const vars = {
                // Change {entity_name} to the friendly name of the entity
                entity_name: (): string => {
                    const unknown = '<unknown>';
                    if (!event.entity_id) return unknown;
                    const serverId = $server.val() as string;
                    const entityRegistry = haData.getEntityFromRegistry(
                        serverId,
                        event.entity_id,
                    );
                    if (!entityRegistry) return unknown;
                    // If the entity registry has a name, use it
                    if (entityRegistry?.name) return entityRegistry.name;

                    const entity = haData.getEntity(
                        serverId,
                        entityRegistry.entity_id,
                    );

                    if (entity) {
                        // If the entity has a friendly name, use it. Otherwise, use the entity_id
                        return entity.attributes.friendly_name === undefined
                            ? entity.entity_id.replace(/_/g, ' ')
                            : (entity.attributes.friendly_name ?? '');
                    }

                    return (
                        entityRegistry.original_name || entityRegistry.entity_id
                    );
                },
                // Change {subtype} to the subtype of the event
                subtype: (): string =>
                    translations[translateKey('subtype')] || event.subtype,
            };
            const objKeys = Object.keys(vars) as (keyof typeof vars)[];
            for (const key of objKeys) {
                const str = `{${key}}`;
                if (desc.indexOf(str) !== -1) {
                    try {
                        const value = vars[key]();
                        desc = desc.replace(str, value);
                    } catch (e) {
                        RED.notify(
                            `Error fetaching translation device event: ${JSON.stringify(e)}`,
                        );
                    }
                }
            }

            return desc;
        };

        const getExtraTypes = (type: DeviceType) => {
            const extraTypes = {
                action: ['sentData'],
                trigger: ['eventData', 'triggerId'],
            };
            return extraTypes[type];
        };

        $('#dialog-form').prepend(ha.betaWarning(1467));
        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: getExtraTypes($type.val() as DeviceType),
        });
    },
    oneditsave: function () {
        const event = getDevice(
            $<HTMLSelectElement>('#node-input-deviceType').val() as string,
        );

        // @ts-ignore - DefinitelyTyped is wrong
        this.inputs = event.inputCount;

        // save device id
        this.device = $('#ha-device').val() as string;

        // save trigger/action data and capabilities
        const $event = $<HTMLSelectElement>('#event');
        const eventType = $event.val() as string;
        if (eventType !== '__NONE__') {
            const events = $event.data('events');
            const capabilities = $event.data('capabilities');
            this.event = events[eventType];
            this.capabilities = deviceUI.getCapabilities(capabilities);
        }
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default DeviceEditor;
