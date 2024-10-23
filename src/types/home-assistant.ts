import {
    HassEntity as HomeAssistantEntity,
    HassEntityAttributeBase,
    HassEventBase,
} from 'home-assistant-js-websocket';

import { DeviceCapabilityType } from '../const';

export type HassArea = {
    aliases: string[];
    area_id: string;
    floor_id: string | null;
    icon: string | null;
    labels: string[];
    name: string;
    picture: string | null;
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
    labels: string[];
    manufacturer?: string;
    model?: string;
    name: string;
    name_by_user?: string;
    sw_version?: string;
    via_device_id?: string;
};

export type SlimHassDevice = Pick<
    HassDevice,
    'area_id' | 'id' | 'labels' | 'name' | 'name_by_user'
>;

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

export interface HassDeviceCapability {
    name: string;
    type: DeviceCapabilityType;
    value: unknown;
    unit: string;
}
export type HassDeviceCapabilities = HassDeviceCapability[];

export interface HassDeviceTrigger {
    device_id: string;
    domain: string;
    entity_id: string;
    metadata: Record<string, unknown>;
    platform: 'device';
    type: string;
}

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

export type HassEvent = HassEventBase & {
    event_type: string;
    event: {
        [key: string]: any;
    };
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

type HassEntityCategory = 'config' | 'diagnostic';

export interface HassEntityRegistryEntry {
    id: string;
    entity_id: string;
    name: string | null;
    icon: string | null;
    platform: string;
    config_entry_id: string | null;
    device_id: string | null;
    area_id: string | null;
    labels: string[];
    disabled_by: 'user' | 'device' | 'integration' | 'config_entry' | null;
    hidden_by: Exclude<HassEntityRegistryEntry['disabled_by'], 'config_entry'>;
    entity_category: HassEntityCategory | null;
    has_entity_name: boolean;
    original_name?: string;
    unique_id: string;
    translation_key?: string;
    options: Record<string, Record<string, unknown>> | null;
    categories: { [scope: string]: string };
    created_at: number;
    modified_at: number;
}

export type SlimHassEntityRegistryEntry = Pick<
    HassEntityRegistryEntry,
    | 'area_id'
    | 'device_id'
    | 'entity_id'
    | 'id'
    | 'labels'
    | 'name'
    | 'original_name'
    | 'platform'
>;

export interface HassFloor {
    alias: string[];
    floor_id: string;
    icon: string | null;
    level: number | null;
    name: string;
}

export interface HassLabel {
    color: string | null;
    description: string | null;
    icon: string | null;
    label_id: string;
    name: string;
}

export type SlimHassEntity = {
    entity_id: HomeAssistantEntity['entity_id'];
    state: HomeAssistantEntity['state'];
    attributes: Pick<
        HassEntityAttributeBase,
        'device_class' | 'friendly_name' | 'supported_features'
    >;
};
