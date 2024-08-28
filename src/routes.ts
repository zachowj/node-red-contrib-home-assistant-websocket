import bonjour from 'bonjour';
import debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import flatten from 'flat';

import issueService from './common/services/IssueService';
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
    let message: string | undefined;
    let success = true;
    const deviceId = req.query.deviceId?.toString();
    const actions = await req?.homeAssistant?.websocket
        .getDeviceActions(deviceId)
        .catch((e) => {
            debug(`Error getting device actions. ${JSON.stringify(e)}`);
            success = false;
            message = e.message;
            return [];
        });

    res.json({ success, data: actions ?? [], message });
}

async function getDeviceActionCapabilities(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    let success = true;
    let message: string | undefined;
    const queryEvent = req.query.event;
    let event: Record<string, unknown>;
    try {
        event = JSON.parse(queryEvent as string);
    } catch (e) {
        success = false;
        message = 'Invalid event';
        res.json({ success, data: [], message });
        return;
    }

    const capabilities = await req?.homeAssistant?.websocket
        .getDeviceActionCapabilities(event)
        .catch((e) => {
            success = false;
            message = e.message;
            return [];
        });

    res.json({ success, data: capabilities ?? [], message });
}

async function getDeviceTriggers(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    let success = true;
    let message: string | undefined;
    const deviceId = req.query.deviceId?.toString();
    const triggers = await req?.homeAssistant?.websocket
        .getDeviceTriggers(deviceId)
        .catch((e) => {
            success = false;
            message = e.message;
            return [];
        });

    res.json({ success, data: triggers ?? [], message });
}

async function getDeviceTriggerCapabilities(
    req: CustomRequest,
    res: Response,
): Promise<void> {
    let success = true;
    let message: string | undefined;
    const queryEvent = req.query.event;
    let event: Record<string, unknown>;
    try {
        event = JSON.parse(queryEvent as string);
    } catch (e) {
        success = false;
        message = 'Invalid event';
        res.json({ success, data: [], message });
        return;
    }

    const capabilities = await req?.homeAssistant?.websocket
        .getDeviceTriggerCapabilities(event)
        .catch((e) => {
            success = false;
            message = e.message;
            return [];
        });

    res.json({ success, data: capabilities ?? [], message });
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
    const entities = homeAssistant?.websocket.getEntities() ?? [];

    tags?.map((t: HassTag) => {
        const tagName = entities.find((e) => e.entity_id === t.id)?.name;

        return {
            id: t.id,
            name: tagName ?? t.name,
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

function postHandleHiddenIssue(req: CustomRequest, res: Response): void {
    const issue = req.body.issue;
    issueService.toggleIssueHiddenStatus(issue);
    res.json({});
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

    RED.httpAdmin.post('/homeassistant/issues/hidden', postHandleHiddenIssue);
}
