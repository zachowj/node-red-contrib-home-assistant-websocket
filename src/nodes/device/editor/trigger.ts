import {
    HassDeviceCapabilities,
    HassDeviceTriggers,
} from '../../../types/home-assistant';
import { DeviceEndpoint, fetchDeviceData } from './utils';
export const inputCount = 0;

export async function getCapabilitiesList(
    trigger: any,
): Promise<HassDeviceCapabilities> {
    return fetchDeviceData<HassDeviceCapabilities>(
        DeviceEndpoint.DeviceTriggerCapabilities,
        { event: JSON.stringify(trigger) },
        'ha-device.error.failed_to_fetch_capabilities',
    );
}

export async function getEventList(
    deviceId: string,
): Promise<HassDeviceTriggers> {
    return fetchDeviceData<HassDeviceTriggers>(
        DeviceEndpoint.DeviceTriggers,
        { deviceId },
        'ha-device.error.failed_to_fetch_actions',
    );
}

export function setDefaultOutputs(config: any) {
    return config;
}
