import * as haServer from '../../../editor/haserver';
import {
    HassDeviceCapabilities,
    HassDeviceTriggers,
} from '../../../types/home-assistant';
export const inputCount = 0;

export const getCapabilitiesList = async (
    trigger: any,
): Promise<HassDeviceCapabilities> =>
    await haServer.fetch('deviceTriggerCapabilities', {
        trigger,
    });

export const getEventList = async (
    deviceId: string,
): Promise<HassDeviceTriggers> =>
    await haServer.fetch('deviceTriggers', {
        deviceId,
    });

export const setDefaultOutputs = (config: any) => {
    return config;
};
