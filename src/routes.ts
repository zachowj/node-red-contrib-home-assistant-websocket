import bonjour from 'bonjour';
import { NextFunction, Request, Response } from 'express';
import flatten from 'flat';
import { HassEntities } from 'home-assistant-js-websocket';

import { RED } from './globals';
import { Credentials } from './homeAssistant';
import HomeAssistant from './homeAssistant/HomeAssistant';
import { HassTag } from './types/home-assistant';
import { ServerNode } from './types/nodes';

function disableCache(req: Request, res: Response, next: NextFunction): void {
    const node = RED.nodes.getNode(req.params.id) as ServerNode<Credentials>;

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
    const deviceId = req.query.deviceId?.toString();
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const actions = await homeAssistant?.websocket.getDeviceActions(deviceId);
    res.json(actions ?? []);
}

async function getDeviceActionCapabilities(
    req: Request,
    res: Response
): Promise<void> {
    const action = req.query.action as { [key: string]: any };
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const capabilities =
        await homeAssistant?.websocket.getDeviceActionCapabilities(action);
    res.json(capabilities ?? []);
}

async function getDeviceTriggers(req: Request, res: Response): Promise<void> {
    const deviceId = req.query.deviceId?.toString();
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const triggers = await homeAssistant?.websocket.getDeviceTriggers(deviceId);
    res.json(triggers ?? []);
}

async function getDeviceTriggerCapabilities(
    req: Request,
    res: Response
): Promise<void> {
    const trigger = req.query.trigger as { [key: string]: any };
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const capabilities =
        await homeAssistant?.websocket.getDeviceTriggerCapabilities(trigger);
    res.json(capabilities ?? []);
}

function getEntities(req: Request, res: Response): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const states = homeAssistant?.getEntities();
    res.json(states ?? []);
}

function getStates(req: Request, res: Response): void {
    const entityId = req.query.entityId?.toString();
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const states = homeAssistant?.websocket.getStates(entityId);
    res.json(states ?? []);
}

function getServices(req: Request, res: Response): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const services = homeAssistant?.websocket.getServices();
    res.json(services ?? []);
}

function getProperties(req: Request, res: Response): void {
    let flat: (string | string[])[] = [];
    let singleEntity = !!req.query.entityId;
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const entityId = req.query.entityId?.toString();

    let states = homeAssistant?.websocket.getStates(entityId);

    if (!states) {
        states = homeAssistant?.websocket.getStates() as HassEntities;
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

async function getTags(req: Request, res: Response): Promise<void> {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const tags = req.query.update
        ? await homeAssistant?.websocket.updateTagList()
        : homeAssistant?.getTags();

    tags?.map((t: HassTag) => {
        return {
            id: t.tag_id,
            name: t.name,
        };
    });

    res.json(tags ?? []);
}

async function getTranslations(req: Request, res: Response): Promise<void> {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const category = req.query.cat?.toString();
    const language = req.query.lang?.toString() ?? 'en';

    if (!category) {
        res.json({});
        return;
    }

    const results = await homeAssistant?.websocket.getTranslations(
        category,
        language
    );

    res.json(results ?? []);
}

function getIntegrationVersion(req: Request, res: Response): void {
    const homeAssistant = getHomeAssistant(req.params.serverId);
    const data = { version: homeAssistant?.integrationVersion ?? 0 };

    res.json(data);
}

function getHomeAssistant(nodeId: string): HomeAssistant | undefined {
    const node = RED.nodes.getNode(nodeId) as ServerNode<Credentials>;

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

export function createRoutes(): void {
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
