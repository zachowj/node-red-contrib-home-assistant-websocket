import bonjour from 'bonjour';
import { NextFunction, Request, Response } from 'express';
import flatten from 'flat';

import { NO_VERSION } from './const';
import { RED } from './globals';
import { getEnvironmentData } from './helpers/diagnostics';
import { getServerConfigNode } from './helpers/node';
import { Credentials, getHomeAssistant } from './homeAssistant';
import HomeAssistant from './homeAssistant/HomeAssistant';
import { HassTag } from './types/home-assistant';
import { ServerNode } from './types/nodes';

interface CustomRequest extends Request {
    homeAssistant?: HomeAssistant;
}

function disableCache(req: Request, res: Response, next: NextFunction): void {
    const node = RED.nodes.getNode(req.params.id) as ServerNode<Credentials>;

    if (node?.config?.cacheJson === false) {
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate',
        );
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    next();
}

function checkHomeAssistant(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
): void {
    try {
        const node = getServerConfigNode(req.params.serverId);
        req.homeAssistant = getHomeAssistant(node);
    } catch (err) {
        const errorMessage = RED._('config-server.errors.no_server_selected');
        res.status(503).send({ error: errorMessage });
        return;
    }

    next();
}

async function getDeviceActions(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    const deviceId = req.query.deviceId?.toString();
    const actions =
        await req?.homeAssistant?.websocket.getDeviceActions(deviceId);
    res.json(actions ?? []);
}

async function getDeviceActionCapabilities(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    const action = req.query.action as { [key: string]: any };
    const capabilities =
        await req?.homeAssistant?.websocket.getDeviceActionCapabilities(action);
    res.json(capabilities ?? []);
}

async function getDeviceTriggers(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    const deviceId = req.query.deviceId?.toString();
    const triggers =
        await req?.homeAssistant?.websocket.getDeviceTriggers(deviceId);
    res.json(triggers ?? []);
}

async function getDeviceTriggerCapabilities(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    const trigger = req.query.trigger as { [key: string]: any };
    const capabilities =
        await req?.homeAssistant?.websocket.getDeviceTriggerCapabilities(
            trigger,
        );
    res.json(capabilities ?? []);
}

function getEntitiesSelect2(req: CustomRequest, res: Response): void {
    const websocket = req?.homeAssistant?.websocket;

    if (!websocket) {
        res.json({ results: [] });
        return;
    }

    const term = req.query.term?.toString().trim();
    const states = Object.values(websocket.getStates());

    const filteredEntities = !term
        ? states
        : states?.filter((entity) => {
              const words = term.split(' ');
              const friendlyName =
                  entity.attributes.friendly_name?.toLowerCase();

              return words.every(
                  (word) =>
                      friendlyName?.indexOf(word) !== -1 ||
                      entity.entity_id?.indexOf(word) !== -1,
              );
          });

    const results = filteredEntities.map((e) => {
        return {
            id: e.entity_id,
            text: e.attributes.friendly_name ?? e.entity_id,
            title: e.entity_id,
        };
    });

    res.json({ results });
}

function getEntities(req: CustomRequest, res: Response): void {
    const states = req?.homeAssistant?.getEntities();
    res.json(states ?? []);
}

function getStates(req: CustomRequest, res: Response): void {
    const entityId = req.query.entityId?.toString();
    const states = req?.homeAssistant?.websocket.getStates(entityId);
    res.json(states ?? []);
}

function getServices(req: CustomRequest, res: Response): void {
    const services = req?.homeAssistant?.websocket.getServices();
    res.json(services ?? []);
}

function getProperties(req: CustomRequest, res: Response): void {
    let flat: (string | string[])[] = [];
    const entityId = req.query.entityId?.toString();

    const entity = req?.homeAssistant?.websocket.getStates(entityId);

    if (Array.isArray(entity)) {
        flat = Object.keys(flatten(entity)).filter(
            (e) =>
                req?.query?.term && e.indexOf(req.query.term.toString()) !== -1,
        );
    } else {
        const entities = req.homeAssistant?.websocket.getStates();
        if (!entities) {
            res.json([]);
            return;
        }
        flat = Object.values(entities).map((entity) =>
            Object.keys(flatten(entity)),
        );
    }
    const uniqProperties = Array.from(
        new Set(([] as string[]).concat(...flat)),
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

async function getTags(req: CustomRequest, res: Response): Promise<void> {
    const homeAssistant = req?.homeAssistant;
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

async function getTranslations(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    const category = req.query.cat?.toString();
    const language = req.query.lang?.toString() ?? 'en';

    if (!category) {
        res.json({});
        return;
    }

    const results = await req?.homeAssistant?.websocket.getTranslations(
        category,
        language,
    );

    res.json(results ?? []);
}

function getIntegrationVersion(req: CustomRequest, res: Response): void {
    res.json({
        version: req?.homeAssistant?.integrationVersion ?? NO_VERSION,
    });
}

function findServers(req: CustomRequest, res: Response): void {
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
        entitiesSelect2: getEntitiesSelect2,
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
            value,
        ),
    );

    RED.httpAdmin.get(
        `/homeassistant/version/:serverId`,
        RED.auth.needsPermission('server.read'),
        checkHomeAssistant,
        getIntegrationVersion,
    );

    RED.httpAdmin.get('/homeassistant/discover', findServers);
    RED.httpAdmin.get(
        '/homeassistant/diagnostics',
        RED.auth.needsPermission('server.read'),
        async (req: CustomRequest, res: Response) => {
            res.send(await getEnvironmentData());
        },
    );
}
