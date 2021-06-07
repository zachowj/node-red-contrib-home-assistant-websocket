import * as bonjour from 'bonjour';
import * as flatten from 'flat';
import { RED } from './globals';
import { Response, Request, NextFunction } from 'express';
import { ConfigNode } from './types/nodes';

function disableCache(req: Request, res: Response, next: NextFunction): void {
    const node = RED.nodes.getNode(req.params.id) as ConfigNode;

    if (node?.config?.cacheJson === false) {
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

function checkHomeAssistant(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    if (!homeAssistant) {
        const errorMessage = RED._('config-server.errors.no_server_selected');
        res.status(503).send({ error: errorMessage });
    } else {
        next();
    }
}

async function getDeviceActions(req: Request, res: Response): Promise<void> {
    const deviceId = req.query.deviceId;
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const actions = await homeAssistant.getDeviceActions(deviceId);
    res.json(actions);
}

async function getDeviceActionCapabilities(
    req: Request,
    res: Response
): Promise<void> {
    const action = req.query.action;
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const capabilities = await homeAssistant.getDeviceActionCapabilities(
        action
    );
    res.json(capabilities);
}

async function getDeviceTriggers(req: Request, res: Response): Promise<void> {
    const deviceId = req.query.deviceId;
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const triggers = await homeAssistant.getDeviceTriggers(deviceId);
    res.json(triggers);
}

async function getDeviceTriggerCapabilities(
    req: Request,
    res: Response
): Promise<void> {
    const trigger = req.query.trigger;
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const capabilities = await homeAssistant.getDeviceTriggerCapabilities(
        trigger
    );
    res.json(capabilities);
}

function getEntities(req: Request, res: Response): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const states = homeAssistant.getEntities();
    res.json(states);
}

function getStates(req: Request, res: Response): void {
    const entityId = req.query.entityId;
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const states = homeAssistant.getStates(entityId);
    res.json(states);
}

function getServices(req: Request, res: Response): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const services = homeAssistant.getServices();
    res.json(services);
}

function getProperties(req: Request, res: Response): void {
    let flat: (string | string[])[] = [];
    let singleEntity = !!req.query.entityId;
    const homeAssistant = getHomeAssistant(req.params.serverId);

    let states = homeAssistant.getStates(req.query.entityId);

    if (!states) {
        states = homeAssistant.getStates();
        singleEntity = false;
    }

    if (singleEntity) {
        flat = Object.keys(flatten(states)).filter(
            (e) =>
                req?.query?.term && e.indexOf(req.query.term.toString()) !== -1
        );
    } else {
        flat = Object.values(states).map((entity) =>
            Object.keys(flatten(entity))
        );
    }

    const uniqProperties = Array.from(
        new Set(([] as string[]).concat(...flat))
    );
    const sortedProperties = uniqProperties.sort((a, b) => {
        if (!a.includes('.') && b.includes('.')) return -1;
        if (a.includes('.') && !b.includes('.')) return 1;
        if (a < b) return -1;
        if (a > b) return 1;

        return 0;
    });

    res.json(sortedProperties);
}

type HassTag = {
    tag_id: string;
    name: string;
    id: string;
    last_scanned: string;
};

async function getTags(req: Request, res: Response): Promise<void> {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    if (req.query.update) {
        await homeAssistant.updateTags();
    }

    const tags = homeAssistant.getTags().map((t: HassTag) => {
        return {
            id: t.tag_id,
            name: t.name,
        };
    });

    res.json(tags);
}

async function getTranslations(req: Request, res: Response): Promise<void> {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const category = req.query.cat;
    const language = req.query.lang;
    const devices = await homeAssistant.getTranslations(category, language);
    res.json(devices.resources);
}

function getIntegrationVersion(req: Request, res: Response): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const client = homeAssistant;
    const data = { version: client ? client.integrationVersion : 0 };

    res.json(data);
}

function getHomeAssistant(nodeId: string) {
    const node = RED.nodes.getNode(nodeId) as ConfigNode;

    return node?.controller?.homeAssistant;
}

function findServers(req: Request, res: Response): void {
    const instances: {
        label: string;
        value: string;
    }[] = [];
    const browser = bonjour().find({ type: 'home-assistant' }, (service) => {
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

export function createRoutes() {
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
            disableCache,
            checkHomeAssistant,
            value
        )
    );

    RED.httpAdmin.get(
        `/homeassistant/version/:serverId`,
        RED.auth.needsPermission('server.read'),
        checkHomeAssistant,
        getIntegrationVersion
    );

    RED.httpAdmin.get('/homeassistant/discover', findServers);
}
