import * as haServer from '../../../editor/haserver';
import {
    HassDeviceActions,
    HassDeviceCapabilities,
} from '../../../types/home-assistant';

export const inputCount = 1;

export const getCapabilitiesList = async (
    action: any,
): Promise<HassDeviceCapabilities> =>
    await haServer.fetch('deviceActionCapabilities', {
        action,
    });

export const getEventList = async (
    deviceId: string,
): Promise<HassDeviceActions> =>
    await haServer.fetch('deviceActions', {
        deviceId,
    });

export const setDefaultOutputs = () => {
    return [];
};
