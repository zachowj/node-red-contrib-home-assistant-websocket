import { EventEmitter } from 'events';
import { URL } from 'url';

import ClientEvents from '../common/events/ClientEvents';
import { RED } from '../globals';
import Comms from '../nodes/config-server/Comms';
import ConnectionLog from '../nodes/config-server/ConnectionLog';
import EditorContext from '../nodes/config-server/EditorContext';
import { ServerNode, ServerNodeConfig } from '../types/nodes';
import HomeAssistant from './HomeAssistant';
import HttpAPI, { HttpConfig } from './Http';
import WebsocketAPI, { ClientEvent, WebsocketConfig } from './Websocket';

export const homeAssistantConnections = new Map<string, HomeAssistant>();

export enum HaEvent {
    AreaRegistryUpdated = 'areas_updated',
    AutomationTriggered = 'automation_triggered',
    DeviceRegistryUpdated = 'devices_updated',
    FloorRegistryUpdated = 'floors_updated',
    Integration = 'nodered',
    LabelRegistryUpdated = 'labels_updated',
    EntityRegistryUpdated = 'entity_registry_updated',
    ServicesUpdated = 'services_updated',
    StateChanged = 'state_changed',
    TagScanned = 'tag_scanned',
    ValueChange = 'value_change',
}

export const SUPERVISOR_URL = 'http://supervisor/core';

export type Credentials = {
    host: string;
    access_token: string;
};

export function hasCredentials(credentials: Credentials): boolean {
    return !!credentials.host && !!credentials.access_token;
}

export function createHomeAssistantClient(
    node: ServerNode<Credentials>,
): HomeAssistant {
    let homeAssistant = homeAssistantConnections.get(node.id);

    if (homeAssistant) return homeAssistant;

    if (!hasCredentials(node.credentials) && !node.config.addon) {
        throw new Error('No credentials provided');
    }

    const eventBus = new EventEmitter();
    eventBus.setMaxListeners(0);
    const creds = createCredentials(node.credentials, node.config);
    const httpConfig = createHttpConfig(creds, node.config);
    const websocketConfig = createWebsocketConfig(creds, node.config);
    const httpAPI = new HttpAPI(httpConfig);
    const websocketAPI = new WebsocketAPI(websocketConfig, eventBus);

    homeAssistant = new HomeAssistant({
        websocketAPI,
        httpAPI,
        eventBus,
    });

    const clientEvents = new ClientEvents({
        node,
        emitter: homeAssistant.eventBus,
    });
    clientEvents.addListener(
        ClientEvent.Connected,
        homeAssistant.subscribeEvents.bind(homeAssistant),
        {
            once: true,
        },
    );
    // eslint-disable-next-line no-new
    new Comms(node.id, homeAssistant, clientEvents);
    // eslint-disable-next-line no-new
    new ConnectionLog(node, clientEvents);
    if (node.config.enableGlobalContextStore) {
        // eslint-disable-next-line no-new
        new EditorContext(node, clientEvents);
    }

    homeAssistant.websocket.connect().catch((e) => {
        node.error(e);
    });

    homeAssistantConnections.set(node.id, homeAssistant);
    return homeAssistant;
}

function createCredentials(
    credentials: Credentials,
    config: ServerNodeConfig,
): Credentials {
    let host;
    if (!credentials) {
        throw new Error('No credentials');
    }
    // eslint-disable-next-line camelcase
    let accessToken = credentials.access_token;

    // Check if using HA Add-on and import proxy token
    const addonBaseUrls = ['http://hassio/homeassistant', SUPERVISOR_URL];

    if (config.addon || addonBaseUrls.includes(credentials.host)) {
        if (!process.env.SUPERVISOR_TOKEN) {
            throw new Error('Supervisor token not found.');
        }
        host = SUPERVISOR_URL;
        // eslint-disable-next-line camelcase
        accessToken = process.env.SUPERVISOR_TOKEN;
    } else {
        host = getBaseUrl(credentials.host);
    }

    return {
        host,
        // eslint-disable-next-line camelcase
        access_token: accessToken,
    };
}

function createHttpConfig(
    credentials: Credentials,
    config: ServerNodeConfig,
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
    },
): WebsocketConfig {
    const connectionDelay =
        credentials.host !== SUPERVISOR_URL
            ? false
            : (config.connectionDelay ?? false);
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
    validateBaseUrl(url);

    return url.trim();
}

function validateBaseUrl(baseUrl: string): string | void {
    if (!baseUrl) {
        throw new Error(RED._('config-server.errors.empty_base_url'));
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(baseUrl);
    } catch (e) {
        throw new Error(RED._('config-server.errors.invalid_base_url'));
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error(RED._('config-server.errors.invalid_protocol'));
    }
}

export function getHomeAssistant(
    serverNode: ServerNode<Credentials>,
): HomeAssistant {
    return (
        homeAssistantConnections.get(serverNode.id) ??
        createHomeAssistantClient(serverNode)
    );
}

export function closeHomeAssistant(nodeId: string): void {
    const homeAssistant = homeAssistantConnections.get(nodeId);
    if (homeAssistant) {
        homeAssistant.close();
        homeAssistantConnections.delete(nodeId);
    }
}
