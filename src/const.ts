export const HA_CLIENT_READY = 'ha_client:ready';
export const HA_EVENT_SERVICES_UPDATED = 'services_updated';
export const HA_EVENT_INTEGRATION = 'nodered';
export const HA_EVENTS = 'ha_events';
export const HA_MIN_VERSION = '2023.12';
export const INTEGRATION_EVENT = 'integration';
export const INTEGRATION_LOADED = 'loaded';
export const INTEGRATION_NOT_LOADED = 'notloaded';
export const INTEGRATION_UNLOADED = 'unloaded';
export const NO_VERSION = '0.0.0';
export const STATE_CONNECTING = 0;
export const STATE_CONNECTED = 1;
export const STATE_DISCONNECTED = 2;
export const STATE_ERROR = 3;
export const STATE_RUNNING = 4;
export const SERVER_ADD = '_ADD_';
export const PRINT_TO_DEBUG_TOPIC = 'home-assistant-print-to-debug';
export const TAGS_ALL = '__ALL_TAGS__';

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
    DoesNotContain = 'does_not_cont',
    StartsWith = 'starts_with',
    InGroup = 'in_group',
    JSONata = 'jsonata',
    IsNull = 'is_null',
    IsNotNull = 'is_not_null',
    IsTrue = 'is_true',
    IsFalse = 'is_false',
    Regex = 'regex',
}

export enum DeviceCapabilityType {
    Boolean = 'boolean',
    Float = 'float',
    Integer = 'integer',
    PositiveTimePeriod = 'positive_time_period_dict',
    Select = 'select',
    String = 'string',
}

export enum EntityType {
    BinarySensor = 'binary_sensor',
    Button = 'button',
    Number = 'number',
    Select = 'select',
    Sensor = 'sensor',
    Switch = 'switch',
    Text = 'text',
    Time = 'time',
}

export enum EntityFilterType {
    Exact = 'exact',
    List = 'list',
    Regex = 'regex',
    Substring = 'substring',
}

export enum NodeType {
    Action = 'api-call-service',
    API = 'ha-api',
    CurrentState = 'api-current-state',
    Device = 'ha-device',
    Entity = 'ha-entity',
    EventsAll = 'server-events',
    EventsCalendar = 'ha-events-calendar',
    EventsState = 'server-state-changed',
    FireEvent = 'ha-fire-event',
    GetEntities = 'ha-get-entities',
    GetHistory = 'api-get-history',
    PollState = 'poll-state',
    RenderTemplate = 'api-render-template',
    Select = 'ha-select',
    Sentence = 'ha-sentence',
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
    TimeEntity = 'ha-time-entity',
    UpdateConfig = 'ha-update-config',
}

export enum ValueIntegrationMode {
    Get = 'get',
    Set = 'set',
    Listen = 'listen',
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
    CalendarItem = 'calendarItem',
    DeviceId = 'deviceId',
}

export enum TimeUnit {
    Milliseconds = 'milliseconds',
    Seconds = 'seconds',
    Minutes = 'minutes',
    Hours = 'hours',
    Days = 'days',
}
