import { getAreaNameById, getDevices } from '../../../editor/data';
import * as haServer from '../../../editor/haserver';
import { i18n } from '../../../editor/i18n';
import { SlimHassDevice } from '../../../types/home-assistant';
import { VirtualSelectOption } from '../../../types/virtual-select';

export enum DeviceEndpoint {
    DeviceActionCapabilities = 'deviceActionCapabilities',
    DeviceActions = 'deviceActions',
    DeviceTriggerCapabilities = 'deviceTriggerCapabilities',
    DeviceTriggers = 'deviceTriggers',
}

/**
 * Builds an array of virtual select options based on the devices associated with a server.
 *
 * @param serverId - The ID of the server.
 * @returns An array of virtual select options.
 */
export function buildDevices(serverId: string) {
    const devices: SlimHassDevice[] = getDevices(serverId);
    const options: VirtualSelectOption[] = [];
    devices.forEach((device) => {
        options.push({
            value: device.id,
            label: device.name_by_user || device.name,
            description: getAreaNameById(serverId, device.area_id),
        });
    });

    options.sort((a, b) =>
        (a.label || a.value).localeCompare(b.label || b.value),
    );
    return options;
}

/**
 * Fetches device data from the specified endpoint.
 *
 * @template T - The type of the data to be fetched.
 * @param {DeviceEndpoint} endpoint - The endpoint to fetch the data from.
 * @param {Record<string, unknown>} data - The data to be sent with the request.
 * @param {string} errorKey - The key used to retrieve the error message.
 * @returns {Promise<T>} - A promise that resolves to the fetched data.
 * @throws {Error} - If an error occurs during the fetch operation.
 */
export async function fetchDeviceData<T>(
    endpoint: DeviceEndpoint,
    data: Record<string, unknown>,
    errorKey: string,
): Promise<T> {
    const response = await haServer
        .fetch<{
            success: boolean;
            data: T;
            message?: string;
        }>(endpoint, data)
        .catch((e) => {
            throw new Error(`${i18n(errorKey)} ${e.message ?? ''}`);
        });

    if (!response.success) {
        throw new Error(`${i18n(errorKey)} ${response.message}`);
    }

    return response.data;
}
