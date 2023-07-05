export const ENTITY_SWITCH = 'switch';
export const ENTITY_DEVICE_TRIGGER = 'device_trigger';
export const HA_CLIENT_READY = 'ha_client:ready';
export const HA_EVENT_AREA_REGISTRY_UPDATED = 'areas_updated';
export const HA_EVENT_DEVICE_REGISTRY_UPDATED = 'devices_updated';
export const HA_EVENT_REGISTRY_UPDATED = 'registry_updated';
export const HA_EVENT_SERVICES_UPDATED = 'services_updated';
export const HA_EVENT_INTEGRATION = 'nodered';
export const HA_EVENT_STATE_CHANGED = 'state_changed';
export const HA_EVENT_TAG_SCANNED = 'tag_scanned';
export const HA_EVENTS = 'ha_events';
export const INTEGRATION_EVENT = 'integration';
export const INTEGRATION_LOADED = 'loaded';
export const INTEGRATION_NOT_LOADED = 'notloaded';
export const INTEGRATION_UNLOADED = 'unloaded';
export const STATE_CONNECTING = 0;
export const STATE_CONNECTED = 1;
export const STATE_DISCONNECTED = 2;
export const STATE_ERROR = 3;
export const STATE_RUNNING = 4;
export const TYPEDINPUT_JSON = 'json';
export const TYPEDINPUT_JSONATA = 'jsonata';
export const ZONE_ENTER = 'enter';
export const ZONE_ENTER_OR_LEAVE = 'enter_leave';
export const ZONE_LEAVE = 'leave';
export const SERVER_ADD = '_ADD_';
export const PRINT_TO_DEBUG_TOPIC = 'home-assistant-print-to-debug';

export enum ComparatorType {
    Is = 'is',
    IsNot = 'is_not',
    IsLessThan = 'lt',
    IsLessThanOrEqual = 'lte',
    IsGreaterThan = 'gt',
    IsGreaterThanOrEqual = 'gte',
    Includes = 'includes',
    DoesNotInclude = 'does_not_include',
    Contains = 'cont',
    StartsWith = 'starts_with',
    InGroup = 'in_group',
    JSONata = 'jsonata',
}

export enum EntityType {
    BinarySensor = 'binary_sensor',
    Button = 'button',
    Number = 'number',
    Select = 'select',
    Sensor = 'sensor',
    Switch = 'switch',
    Text = 'text',
}

export enum EntityFilterType {
    Exact = 'exact',
    List = 'list',
    Regex = 'regex',
    Substring = 'substring',
}

export enum NodeType {
    API = 'ha-api',
    CallSevice = 'api-call-service',
    CurrentState = 'api-current-state',
    Device = 'ha-device',
    Entity = 'ha-entity',
    EventsAll = 'server-events',
    EventsState = 'server-state-changed',
    FireEvent = 'ha-fire-event',
    GetEntities = 'ha-get-entities',
    GetHistory = 'api-get-history',
    PollState = 'poll-state',
    RenderTemplate = 'api-render-template',
    Select = 'ha-select',
    TriggerState = 'trigger-state',
    Tag = 'ha-tag',
    Time = 'ha-time',
    WaitUntil = 'ha-wait-until',
    Webhook = 'ha-webhook',
    Zone = 'ha-zone',

    Server = 'server',
    DeviceConfig = 'ha-device-config',
    EntityConfig = 'ha-entity-config',

    BinarySensor = 'ha-binary-sensor',
    Button = 'ha-button',
    Number = 'ha-number',
    Sensor = 'ha-sensor',
    Switch = 'ha-switch',
    Text = 'ha-text',
    UpdateConfig = 'ha-update-config',
}

export enum ValueIntegrationMode {
    In = 'in',
    Out = 'out',
}

export enum TypedInputTypes {
    Message = 'msg',
    Flow = 'flow',
    Global = 'global',
    Boolean = 'bool',
    JSON = 'json',
    Date = 'date',
    JSONata = 'jsonata',
    Number = 'num',
    String = 'str',
    None = 'none',
    Config = 'config',
    Data = 'data',
    Entity = 'entity',
    EntityState = 'entityState',
    EventData = 'eventData',
    Headers = 'headers',
    Params = 'params',
    TriggerId = 'triggerId',
    PrevEntity = 'prevEntity',
    Results = 'results',
    Regex = 're',
    Value = 'value',
    PreviousValue = 'previousValue',
}

export enum TimeUnit {
    Milliseconds = 'milliseconds',
    Seconds = 'seconds',
    Minutes = 'minutes',
    Hours = 'hours',
    Days = 'days',
}
