const bonjour = require('bonjour')();
const flatten = require('flat');
const selectn = require('selectn');

let getNode;
let errorMessage;

function disableCache(req, res, next) {
    const node = getNode(req.params.id);

    if (selectn('config.cacheJson', node) === false) {
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    next();
}

function setHomeAssistant(req, res, next) {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    if (!homeAssistant) {
        return res.status(503).send({ error: errorMessage });
    }

    req.homeAssistant = homeAssistant;
    next();
}

async function getDeviceActions(req, res) {
    const deviceId = req.query.deviceId;
    const actions = await req.homeAssistant.getDeviceActions(deviceId);
    res.json(actions);
}

async function getDeviceActionCapabilities(req, res) {
    const action = req.query.action;
    const capabilities = await req.homeAssistant.getDeviceActionCapabilities(
        action
    );
    res.json(capabilities);
}

async function getDeviceTriggers(req, res) {
    const deviceId = req.query.deviceId;
    const triggers = await req.homeAssistant.getDeviceTriggers(deviceId);
    res.json(triggers);
}

async function getDeviceTriggerCapabilities(req, res) {
    const trigger = req.query.trigger;
    const capabilities = await req.homeAssistant.getDeviceTriggerCapabilities(
        trigger
    );
    res.json(capabilities);
}

function getEntities(req, res) {
    const states = req.homeAssistant.getEntities();
    res.json(states);
}

function getStates(req, res) {
    const entityId = req.query.entityId;
    const states = req.homeAssistant.getStates(entityId);
    res.json(states);
}

function getServices(req, res) {
    const services = req.homeAssistant.getServices();
    res.json(services);
}

function getProperties(req, res) {
    let flat = [];
    let singleEntity = !!req.query.entityId;

    let states = req.homeAssistant.getStates(req.query.entityId);

    if (!states) {
        states = req.homeAssistant.getStates();
        singleEntity = false;
    }

    if (singleEntity) {
        flat = Object.keys(flatten(states)).filter(
            (e) => e.indexOf(req.query.term) !== -1
        );
    } else {
        flat = Object.values(states).map((entity) =>
            Object.keys(flatten(entity))
        );
    }
    const uniqProperties = [...new Set([].concat(...flat))];
    const sortedProperties = uniqProperties.sort((a, b) => {
        if (!a.includes('.') && b.includes('.')) return -1;
        if (a.includes('.') && !b.includes('.')) return 1;
        if (a < b) return -1;
        if (a > b) return 1;

        return 0;
    });

    res.json(sortedProperties);
}

async function getTags(req, res) {
    if (req.query.update) {
        await req.homeAssistant.updateTags();
    }

    const tags = req.homeAssistant.getTags().map((t) => {
        return {
            id: t.tag_id,
            name: t.name,
        };
    });

    res.json(tags);
}

async function getTranslations(req, res) {
    const category = req.query.cat;
    const language = req.query.lang;
    const devices = await req.homeAssistant.getTranslations(category, language);
    res.json(devices.resources);
}

function getIntegrationVersion(req, res) {
    const client = req.homeAssistant;
    const data = { version: client ? client.integrationVersion : 0 };

    res.json(data);
}

function getHomeAssistant(nodeId) {
    const node = getNode(nodeId);
    return selectn('controller.homeAssistant', node);
}

function findServers(req, res) {
    const instances = [];
    const browser = bonjour.find({ type: 'home-assistant' }, (service) => {
        instances.push({
            label: service.name
                ? `${service.name} (${service.txt.base_url})`
                : service.txt.base_url,
            value: service.txt.base_url,
        });
    });

    // Add a bit of delay for all services to be discovered
    setTimeout(() => {
        res.json(instances);
        browser.stop();
    }, 3000);
}

function createRoutes(RED) {
    getNode = RED.nodes.getNode;
    errorMessage = RED._('config-server.errors.no_server_selected');

    const endpoints = {
        deviceActions: getDeviceActions,
        deviceActionCapabilities: getDeviceActionCapabilities,
        deviceTriggers: getDeviceTriggers,
        deviceTriggerCapabilities: getDeviceTriggerCapabilities,
        entities: getEntities,
        properties: getProperties,
        services: getServices,
        states: getStates,
        tags: getTags,
        translations: getTranslations,
    };
    Object.entries(endpoints).forEach(([key, value]) =>
        RED.httpAdmin.get(
            `/homeassistant/${key}/:serverId?`,
            RED.auth.needsPermission('server.read'),
            disableCache.bind(this),
            setHomeAssistant,
            value.bind(this)
        )
    );

    RED.httpAdmin.get(
        `/homeassistant/version/:serverId`,
        RED.auth.needsPermission('server.read'),
        setHomeAssistant,
        getIntegrationVersion
    );

    RED.httpAdmin.get('/homeassistant/discover', findServers);
}

module.exports = {
    createRoutes,
};
