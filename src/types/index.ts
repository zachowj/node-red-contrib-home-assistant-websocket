import {
    INTEGRATION_LOADED,
    INTEGRATION_NOT_LOADED,
    INTEGRATION_UNLOADED,
} from '../const';

export type IntegrationEvent =
    | typeof INTEGRATION_LOADED
    | typeof INTEGRATION_NOT_LOADED
    | typeof INTEGRATION_UNLOADED;
