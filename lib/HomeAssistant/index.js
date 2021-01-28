'use strict';
const url = require('url');
const { EventEmitter } = require('events');

const HomeAssistant = require('./HomeAssistant');
const HttpAPI = require('./Http');
const WebsocketAPI = require('./Websocket');

const SUPERVISOR_URL = 'http://supervisor/core';

function createHomeAssistantClient(config, credentials) {
    const creds = createCredentials(config, credentials);
    const httpConfig = createHttpConfig(config, creds);
    const websocketConfig = createWebsocketConfig(config, creds);
    const eventBus = new EventEmitter();
    eventBus.setMaxListeners(0);
    const httpAPI = new HttpAPI(httpConfig);
    const websocketAPI = new WebsocketAPI(websocketConfig, eventBus);

    return new HomeAssistant({ websocketAPI, httpAPI, eventBus });
}

function createCredentials(config, credentials) {
    let url;
    let apiPass = credentials.access_token;

    // For backwards compatibility prior to v0.0.4 when loading url and pass from flow.json
    if (config.url) {
        url = credentials.host || config.url;
        apiPass = credentials.access_token || config.pass;
    }

    // Check if using HA Add-on and import proxy token
    const addonBaseUrls = ['http://hassio/homeassistant', SUPERVISOR_URL];

    if (config.addon || addonBaseUrls.includes(credentials.host)) {
        url = SUPERVISOR_URL;
        apiPass = process.env.SUPERVISOR_TOKEN;
    } else {
        url = getBaseUrl(credentials.host);
    }

    return {
        url,
        apiPass,
    };
}

function createHttpConfig(
    config = { legacy: false, rejectUnauthorizedCerts: true },
    credentials
) {
    return {
        apiPass: credentials.apiPass,
        baseUrl: credentials.url,
        legacy: config.legacy,
        rejectUnauthorizedCerts: config.rejectUnauthorizedCerts,
    };
}

function createWebsocketConfig(
    config = { legacy: false, rejectUnauthorizedCerts: true },
    credentials
) {
    const connectionDelay =
        credentials.url !== SUPERVISOR_URL ? false : config.connectionDelay;

    return {
        apiPass: credentials.apiPass,
        baseUrl: credentials.url,
        legacy: config.legacy,
        rejectUnauthorizedCerts: config.rejectUnauthorizedCerts,
        connectionDelay,
    };
}

function getBaseUrl(url) {
    const baseUrl = url.trim();
    const errorMessage = validateBaseUrl(baseUrl);
    if (errorMessage) {
        throw new Error(errorMessage);
    }

    return baseUrl;
}

function validateBaseUrl(baseUrl) {
    if (!baseUrl) {
        return 'config-server.errors.empty_base_url';
    }

    let parsedUrl;
    try {
        // eslint-disable-next-line no-new
        parsedUrl = new url.URL(baseUrl);
    } catch (e) {
        return 'config-server.errors.invalid_base_url';
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return 'config-server.errors.invalid_protocol';
    }
}

module.exports = createHomeAssistantClient;
