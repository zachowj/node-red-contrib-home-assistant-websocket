import {
    HassDeviceActions,
    HassDeviceCapabilities,
} from '../../../types/home-assistant';
import { DeviceEndpoint, fetchDeviceData } from './utils';

export const inputCount = 1;

export async function getCapabilitiesList(
    action: any,
): Promise<HassDeviceCapabilities> {
    return fetchDeviceData<HassDeviceCapabilities>(
        DeviceEndpoint.DeviceActionCapabilities,
        { event: JSON.stringify(action) },
        'ha-device.error.failed_to_fetch_capabilities',
    );
}

export async function getEventList(
    deviceId: string,
): Promise<HassDeviceActions> {
    return fetchDeviceData<HassDeviceActions>(
        DeviceEndpoint.DeviceActions,
        { deviceId },
        'ha-device.error.failed_to_fetch_actions',
    );
}

export function setDefaultOutputs() {
    return [];
}
