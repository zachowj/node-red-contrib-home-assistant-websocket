/* eslint-disable camelcase */
import {
    HassEntity as HomeAssistantEntity,
    HassEventBase,
} from 'home-assistant-js-websocket';

export type HassArea = {
    area_id: string;
    name: string;
    picture?: string;
};

export type HassAreas = HassArea[];

export type HassDevice = {
    area_id?: string;
    config_entries?: string[];
    connections?: any[];
    disabled_by?: string;
    entry_type: string;
    id: string;
    identifiers?: string[][];
    manufacturer?: string;
    model?: string;
    name: string;
    name_by_user?: string;
    sw_version?: string;
    via_device_id?: string;
};

export type HassDevices = HassDevice[];

export type HassTag = {
    id: string;
    last_scanned: string;
    name: string;
    tag_id: string;
};

export type HassTags = HassTag[];

export type HassTranslation = {
    [id: string]: string;
};

export type HassTranslations = HassTranslation[];

export type HassDeviceCapability = {
    name: string;
    type: string;
};

export type HassDeviceCapabilities = HassDeviceCapability[];

export type HassDeviceTrigger = {
    device_id: string;
    domain: string;
    entity_id: string;
    platform: string;
    type: string;
};

export type HassDeviceTriggers = HassDeviceTrigger[];

export type SubscriptionUnsubscribe = () => Promise<void>;

export type HassIntegrationEvent = {
    type: string;
    version: string;
};

export type HassDeviceAction = {
    type: string;
    device_id: string;
    entity_id: string;
    domain: string;
};

export type HassDeviceActions = HassDeviceAction[];

export type HassData = {
    [key: string]: any;
};

export type HassEntity = Omit<HomeAssistantEntity, 'state'> & {
    original_state: string;
    state: string | number | boolean | RegExp | string[];
    timeSinceChangedMs: number;
};

export type HassStateChangedEvent = HassEventBase & {
    event_type: string;
    entity_id: string;
    event: {
        entity_id: string;
        new_state: HassEntity | null;
        old_state: HassEntity | null;
    };
};

export interface HassEntityRegistryEntry {
    entity_id: string;
    name: string | null;
    icon: string | null;
    platform: string;
    config_entry_id: string | null;
    device_id: string | null;
    area_id: string | null;
    disabled_by: string | null;
    entity_category: 'config' | 'diagnostic' | null;
}
