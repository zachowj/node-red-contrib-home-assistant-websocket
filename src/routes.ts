import bonjour from 'bonjour';
import { NextFunction, Request, Response } from 'express';
import flatten from 'flat';
import { HassEntities } from 'home-assistant-js-websocket';

import { RED } from './globals';
import { getServerConfigNode } from './helpers/node';
import { Credentials, getHomeAssistant } from './homeAssistant';
import HomeAssistant from './homeAssistant/HomeAssistant';
import { HassTag } from './types/home-assistant';
import { ServerNode } from './types/nodes';

interface CustomRequest extends Request {
    homeAssistant?: HomeAssistant;
}

const disableCache = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
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
};

const checkHomeAssistant = (
    req: CustomRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const node = getServerConfigNode(req.params.serverId);
        req.homeAssistant = getHomeAssistant(node);
    } catch (err) {
        const errorMessage = RED._('config-server.errors.no_server_selected');
        res.status(503).send({ error: errorMessage });
        return;
    }

    next();
};

const getDeviceActions = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const deviceId = req.query.deviceId?.toString();
    const actions = await req?.homeAssistant?.websocket.getDeviceActions(
        deviceId
    );
    res.json(actions ?? []);
};

const getDeviceActionCapabilities = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const action = req.query.action as { [key: string]: any };
    const capabilities =
        await req?.homeAssistant?.websocket.getDeviceActionCapabilities(action);
    res.json(capabilities ?? []);
};

const getDeviceTriggers = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const deviceId = req.query.deviceId?.toString();
    const triggers = await req?.homeAssistant?.websocket.getDeviceTriggers(
        deviceId
    );
    res.json(triggers ?? []);
};

const getDeviceTriggerCapabilities = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const trigger = req.query.trigger as { [key: string]: any };
    const capabilities =
        await req?.homeAssistant?.websocket.getDeviceTriggerCapabilities(
            trigger
        );
    res.json(capabilities ?? []);
};

const getEntities = (req: CustomRequest, res: Response): void => {
    const states = req?.homeAssistant?.getEntities();
    res.json(states ?? []);
};

const getStates = (req: CustomRequest, res: Response): void => {
    const entityId = req.query.entityId?.toString();
    const states = req?.homeAssistant?.websocket.getStates(entityId);
    res.json(states ?? []);
};

const getServices = (req: CustomRequest, res: Response): void => {
    const services = req?.homeAssistant?.websocket.getServices();
    res.json(services ?? []);
};

const getProperties = (req: CustomRequest, res: Response): void => {
    let flat: (string | string[])[] = [];
    let singleEntity = !!req.query.entityId;
    const entityId = req.query.entityId?.toString();

    let states = req?.homeAssistant?.websocket.getStates(entityId);

    if (!states) {
        states = req?.homeAssistant?.websocket.getStates() as HassEntities;
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
};

const getTags = async (req: CustomRequest, res: Response): Promise<void> => {
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
};

const getTranslations = async (
    req: CustomRequest,
    res: Response
): Promise<void> => {
    const category = req.query.cat?.toString();
    const language = req.query.lang?.toString() ?? 'en';

    if (!category) {
        res.json({});
        return;
    }

    const results = await req?.homeAssistant?.websocket.getTranslations(
        category,
        language
    );

    res.json(results ?? []);
};

const getIntegrationVersion = (req: CustomRequest, res: Response): void => {
    const data = { version: req?.homeAssistant?.integrationVersion ?? 0 };

    res.json(data);
};

const findServers = (req: CustomRequest, res: Response): void => {
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
};

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
