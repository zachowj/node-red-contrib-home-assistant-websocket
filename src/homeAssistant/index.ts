import { EventEmitter } from 'events';
import { URL } from 'url';

import { ServerNodeConfig } from '../types/nodes';
import HomeAssistant from './HomeAssistant';
import HttpAPI, { HttpConfig } from './Http';
import WebsocketAPI, { WebsocketConfig } from './Websocket';

export const SUPERVISOR_URL = 'http://supervisor/core';

export type Credentials = {
    host: string;
    // eslint-disable-next-line camelcase
    access_token: string;
};

export function createHomeAssistantClient(
    config: ServerNodeConfig,
    credentials: Credentials
): HomeAssistant {
    const eventBus = new EventEmitter();
    eventBus.setMaxListeners(0);
    const creds = createCredentials(credentials, config);
    const httpConfig = createHttpConfig(creds, config);
    const websocketConfig = createWebsocketConfig(creds, config);
    const httpAPI = new HttpAPI(httpConfig);
    const websocketAPI = new WebsocketAPI(websocketConfig, eventBus);

    return new HomeAssistant({ websocketAPI, httpAPI, eventBus });
}

function createCredentials(
    credentials: Credentials,
    config: ServerNodeConfig
): Credentials {
    let host;
    // eslint-disable-next-line camelcase
    let access_token = credentials.access_token;

    // Check if using HA Add-on and import proxy token
    const addonBaseUrls = ['http://hassio/homeassistant', SUPERVISOR_URL];

    if (config.addon || addonBaseUrls.includes(credentials.host)) {
        if (!process.env.SUPERVISOR_TOKEN) {
            throw new Error('Supervisor token not found.');
        }
        host = SUPERVISOR_URL;
        // eslint-disable-next-line camelcase
        access_token = process.env.SUPERVISOR_TOKEN;
    } else {
        host = getBaseUrl(credentials.host);
    }

    return {
        host,
        // eslint-disable-next-line camelcase
        access_token,
    };
}

function createHttpConfig(
    credentials: Credentials,
    config: ServerNodeConfig
): HttpConfig {
    return {
        access_token: credentials.access_token,
        host: credentials.host,
        rejectUnauthorizedCerts: config.rejectUnauthorizedCerts,
    };
}

function createWebsocketConfig(
    credentials: Credentials,
    config: Partial<ServerNodeConfig> = {
        rejectUnauthorizedCerts: true,
        connectionDelay: true,
    }
): WebsocketConfig {
    const connectionDelay =
        credentials.host !== SUPERVISOR_URL
            ? false
            : config.connectionDelay ?? false;
    const heartbeatInterval = Number(config.heartbeatInterval) ?? 0;
    const heartbeat =
        config.heartbeat && Number.isInteger(heartbeatInterval)
            ? heartbeatInterval
            : 0;

    return {
        access_token: credentials.access_token,
        host: credentials.host,
        rejectUnauthorizedCerts: config.rejectUnauthorizedCerts ?? true,
        connectionDelay,
        heartbeatInterval: heartbeat,
    };
}

function getBaseUrl(url: string): string {
    const errorMessage = validateBaseUrl(url);
    if (errorMessage) {
        throw new Error(errorMessage);
    }

    return url.trim();
}

function validateBaseUrl(baseUrl: string): string | void {
    if (!baseUrl) {
        return 'config-server.errors.empty_base_url';
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(baseUrl);
    } catch (e) {
        return 'config-server.errors.invalid_base_url';
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return 'config-server.errors.invalid_protocol';
    }
}
